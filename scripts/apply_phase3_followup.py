#!/usr/bin/env python3
"""Apply CodeBloom's Phase 3 follow-up migration to the authorized test project.

The database URL is read only from SUPABASE_DB_URL. It is never printed or
saved. Execution is opt-in and guarded by the test project's Supabase ref.
"""

from __future__ import annotations

import argparse
from getpass import getpass
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "supabase" / "migrations" / "20261027204500_auth_profiles_atomic_projects.sql"
TEST_PROJECT_REF = "zijxeexudzeysaqicyqb"
EXPECTED_START = "-- Phase 3 follow-up: make generated profiles resilient and restrict editable columns."
EXPECTED_END = "GRANT EXECUTE ON FUNCTION public.create_project_with_tags(text, text, text, text, text, text, text[]) TO authenticated;"
REQUIRED_MARKERS = (
    "CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()",
    "ALTER TABLE public.projects",
    "CREATE OR REPLACE FUNCTION public.create_project_with_tags(",
)


class RunnerError(Exception):
    """A safe-to-display preflight or execution error."""


def load_migration() -> str:
    try:
        sql = MIGRATION.read_text(encoding="utf-8")
    except OSError as exc:
        raise RunnerError(f"Could not read the migration file: {exc}") from exc

    normalized = sql.strip()
    if not normalized.startswith(EXPECTED_START) or not normalized.endswith(EXPECTED_END):
        raise RunnerError("The migration file does not match the expected Phase 3 follow-up boundaries; refusing to execute it.")
    missing = [marker for marker in REQUIRED_MARKERS if marker not in normalized]
    if missing or re.search(r"\bCREATE\s+TABLE\b", normalized, re.IGNORECASE):
        raise RunnerError("The migration contents failed the safety checks; refusing to execute it.")
    return normalized


def identify_project(dsn: str) -> tuple[str, str]:
    parsed = urlsplit(dsn)
    if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
        raise RunnerError("SUPABASE_DB_URL must be a PostgreSQL URI connection string.")

    host = parsed.hostname.lower()
    username = unquote(parsed.username or "")
    host_match = re.fullmatch(r"db\.([a-z0-9]{20})\.supabase\.co", host)
    host_ref = host_match.group(1) if host_match else None
    pooler_host = host.endswith(".pooler.supabase.com")
    user_match = re.fullmatch(r"postgres\.([a-z0-9]{20})", username.lower()) if pooler_host else None
    user_ref = user_match.group(1) if user_match else None
    ref = host_ref or user_ref
    if ref != TEST_PROJECT_REF:
        raise RunnerError(
            "The connection string does not identify the authorized CodeBloom test project. "
            "Use its direct Supabase host or a pooler username containing that project's ref."
        )
    if host_ref and user_ref and host_ref != user_ref:
        raise RunnerError("The project ref in the database host and pooler username do not match.")
    return host, parsed.path.lstrip("/") or "postgres"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="apply the migration (without this flag, perform connection and preflight checks only)",
    )
    parser.add_argument(
        "--confirm-test-project",
        metavar="PROJECT_REF",
        help="required with --apply; must be the exact authorized non-production project ref",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.apply and args.confirm_test_project != TEST_PROJECT_REF:
        print(
            "Refusing to apply: pass --confirm-test-project "
            f"{TEST_PROJECT_REF} to confirm this non-production target.",
            file=sys.stderr,
        )
        return 2

    dsn = os.environ.get("SUPABASE_DB_URL", "").strip()
    if not dsn:
        if not sys.stdin.isatty():
            print("Run this command in an interactive terminal so the database URI can be entered invisibly.", file=sys.stderr)
            return 2
        try:
            dsn = getpass("Test-project PostgreSQL URI (input hidden): ").strip()
        except (EOFError, KeyboardInterrupt):
            print("No connection URI was accepted; nothing was changed.", file=sys.stderr)
            return 2
        if not dsn:
            print("No connection URI was entered; nothing was changed.", file=sys.stderr)
            return 2

    try:
        sql = load_migration()
        host, database = identify_project(dsn)
    except RunnerError as exc:
        print(f"Preflight failed: {exc}", file=sys.stderr)
        return 2

    try:
        import psycopg
        from psycopg import ClientCursor
    except ImportError:
        print(
            "The psycopg 3 driver is required. Install it in a virtual environment with: "
            "python -m pip install 'psycopg[binary]>=3.2,<4'",
            file=sys.stderr,
        )
        return 2

    connection = None
    try:
        connection = psycopg.connect(dsn, sslmode="require", connect_timeout=15)
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SET LOCAL statement_timeout = '120s'")
                cursor.execute("SET LOCAL lock_timeout = '10s'")
                cursor.execute(
                    """
                    SELECT
                      to_regclass('public.profiles') IS NOT NULL,
                      to_regclass('public.projects') IS NOT NULL,
                      to_regclass('public.project_tags') IS NOT NULL,
                      to_regclass('public.bookmarks') IS NOT NULL,
                      to_regprocedure('public.create_project_with_tags(text,text,text,text,text,text,text[])') IS NOT NULL,
                      EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conrelid = to_regclass('public.projects')
                          AND conname IN ('projects_repository_url_https_check', 'projects_demo_url_https_check')
                      )
                    """
                )
                profiles, projects, tags, bookmarks, rpc_exists, constraint_exists = cursor.fetchone()

            if not all((profiles, projects, tags, bookmarks)):
                raise RunnerError("The base CodeBloom migration is incomplete; all four expected public tables must exist.")
            if rpc_exists or constraint_exists:
                raise RunnerError(
                    "A follow-up RPC or URL constraint already exists. This may be a prior/partial application; "
                    "the runner will not risk repeating non-idempotent DDL. Inspect the database first."
                )

            print(f"Connected to the expected test project at {host}, database {database}.")
            print(f"Preflight passed; the pending migration is {len(sql)} characters.")
            if not args.apply:
                print("Dry run only: no SQL changes were made. Add --apply and the exact project confirmation to apply it.")
                return 0

            with connection.cursor() as cursor:
                cursor.execute("SELECT pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(%s))", ("codebloom:phase3:20261027204500",))

            # ClientCursor uses client-side binding/simple-query mode, allowing PostgreSQL
            # to parse the migration's complete multi-statement SQL as one transaction.
            with ClientCursor(connection) as cursor:
                cursor.execute(sql)

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                      to_regprocedure('public.create_project_with_tags(text,text,text,text,text,text,text[])') IS NOT NULL,
                      EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.projects'::regclass AND conname = 'projects_repository_url_https_check'),
                      EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.projects'::regclass AND conname = 'projects_demo_url_https_check'),
                      has_column_privilege('authenticated', 'public.profiles', 'bio', 'UPDATE'),
                      NOT has_column_privilege('authenticated', 'public.profiles', 'updated_at', 'UPDATE'),
                      has_function_privilege('authenticated', 'public.create_project_with_tags(text,text,text,text,text,text,text[])', 'EXECUTE'),
                      NOT has_function_privilege('anon', 'public.create_project_with_tags(text,text,text,text,text,text,text[])', 'EXECUTE')
                    """
                )
                postconditions = cursor.fetchone()
                if not all(postconditions):
                    raise RunnerError("Post-apply security checks failed; the transaction will be rolled back.")

        print("Migration applied and committed successfully; all post-apply checks passed.")
        print("Note: direct SQL execution does not create a Supabase CLI migration-history entry.")
        return 0
    except RunnerError as exc:
        print(f"Migration not applied: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # keep credentials and full DSN out of diagnostics
        state = getattr(exc, "sqlstate", None)
        primary = getattr(getattr(exc, "diag", None), "message_primary", None)
        detail = f" SQLSTATE {state}." if state else ""
        if primary:
            detail += f" {primary}"
        print(f"Database operation failed.{detail} Transaction rolled back if it had begun.", file=sys.stderr)
        return 1
    finally:
        if connection is not None:
            connection.close()


if __name__ == "__main__":
    raise SystemExit(main())
