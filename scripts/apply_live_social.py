#!/usr/bin/env python3
"""Preflight/apply the additive live-feed social migration to CodeBloom's test DB.

The database URI is read only from SUPABASE_DB_URL or a hidden interactive prompt.
No SQL runs without --apply and the exact non-production project confirmation.
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
MIGRATION = ROOT / "supabase" / "migrations" / "20261028210000_live_feed_social.sql"
TEST_PROJECT_REF = "zijxeexudzeysaqicyqb"
START = "-- Live dashboard feed social features. Additive only; does not modify existing project/profile rows."
END = "GRANT SELECT ON TABLE public.project_vote_totals, public.project_comment_totals TO anon, authenticated;\nGRANT SELECT ON TABLE public.project_comments TO anon, authenticated;\nGRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_votes TO authenticated;\nGRANT SELECT, INSERT, DELETE ON TABLE public.creator_follows TO authenticated;\nGRANT INSERT, DELETE ON TABLE public.project_comments TO authenticated;\nGRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;"
REQUIRED = ("CREATE TABLE public.project_votes", "CREATE TABLE public.creator_follows", "CREATE TABLE public.project_comments", "CREATE VIEW public.project_vote_totals", "CREATE VIEW public.project_comment_totals", "ENABLE ROW LEVEL SECURITY")
OBJECTS = ("public.project_votes", "public.creator_follows", "public.project_comments", "public.project_vote_totals", "public.project_comment_totals")

class RunnerError(Exception):
    pass

def load_sql() -> str:
    try:
        sql = MIGRATION.read_text(encoding="utf-8").strip()
    except OSError as exc:
        raise RunnerError(f"Could not read migration: {exc}") from exc
    if not sql.startswith(START) or not sql.endswith(END):
        raise RunnerError("Migration boundaries differ from the reviewed live-social migration; refusing to execute.")
    if any(marker not in sql for marker in REQUIRED) or re.search(r"\bDROP\s+(TABLE|VIEW|POLICY)\b", sql, re.I):
        raise RunnerError("Migration failed additive-schema checks; refusing to execute.")
    return sql

def verify_target(dsn: str) -> tuple[str, str]:
    parsed = urlsplit(dsn)
    if parsed.scheme not in {"postgres", "postgresql"} or not parsed.hostname:
        raise RunnerError("SUPABASE_DB_URL must be a PostgreSQL URI.")
    host = parsed.hostname.lower()
    username = unquote(parsed.username or "")
    direct = re.fullmatch(r"db\.([a-z0-9]{20})\.supabase\.co", host)
    pooler = host.endswith(".pooler.supabase.com")
    pooled = re.fullmatch(r"postgres\.([a-z0-9]{20})", username.lower()) if pooler else None
    ref = direct.group(1) if direct else pooled.group(1) if pooled else None
    if ref != TEST_PROJECT_REF:
        raise RunnerError("Connection URI does not identify the authorized CodeBloom non-production project.")
    return host, parsed.path.lstrip("/") or "postgres"

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="apply the migration; without this, only perform preflight")
    parser.add_argument("--confirm-test-project", metavar="PROJECT_REF")
    args = parser.parse_args()
    if args.apply and args.confirm_test_project != TEST_PROJECT_REF:
        print(f"Refusing to apply: pass --confirm-test-project {TEST_PROJECT_REF}.", file=sys.stderr)
        return 2
    dsn = os.environ.get("SUPABASE_DB_URL", "").strip()
    if not dsn:
        if not sys.stdin.isatty():
            print("Run interactively so the database URI can be entered invisibly.", file=sys.stderr)
            return 2
        try:
            dsn = getpass("Test-project PostgreSQL URI (input hidden): ").strip()
        except (EOFError, KeyboardInterrupt):
            print("No connection URI accepted; no changes made.", file=sys.stderr)
            return 2
    try:
        sql = load_sql()
        host, database = verify_target(dsn)
        import psycopg
        from psycopg import ClientCursor
    except RunnerError as exc:
        print(f"Preflight failed: {exc}", file=sys.stderr)
        return 2
    except ImportError:
        print("psycopg 3 is required; install psycopg[binary] in the local ignored migration environment.", file=sys.stderr)
        return 2

    connection = None
    try:
        connection = psycopg.connect(dsn, sslmode="require", connect_timeout=15)
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SET LOCAL statement_timeout = '120s'")
                cursor.execute("SET LOCAL lock_timeout = '10s'")
                cursor.execute("SELECT to_regclass('public.profiles') IS NOT NULL, to_regclass('public.projects') IS NOT NULL, to_regclass('public.bookmarks') IS NOT NULL")
                if not all(cursor.fetchone()):
                    raise RunnerError("The existing profiles/projects/bookmarks schema is incomplete.")
                cursor.execute("SELECT " + ", ".join("to_regclass(%s) IS NOT NULL" for _ in OBJECTS), OBJECTS)
                exists = cursor.fetchone()
                if any(exists):
                    raise RunnerError("At least one live-social object already exists; inspect the database instead of replaying this migration.")
            print(f"Connected to expected test project at {host}, database {database}.")
            print(f"Preflight passed for additive migration ({len(sql)} characters).")
            if not args.apply:
                print("Dry run only: no SQL changes were made.")
                return 0
            with connection.cursor() as cursor:
                cursor.execute("SELECT pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(%s))", ("codebloom:live-social:20261028210000",))
            with ClientCursor(connection) as cursor:
                cursor.execute(sql)
            with connection.cursor() as cursor:
                cursor.execute("""
                  SELECT
                    to_regclass('public.project_votes') IS NOT NULL,
                    to_regclass('public.creator_follows') IS NOT NULL,
                    to_regclass('public.project_comments') IS NOT NULL,
                    to_regclass('public.project_vote_totals') IS NOT NULL,
                    to_regclass('public.project_comment_totals') IS NOT NULL,
                    (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.project_votes'::regclass),
                    (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.creator_follows'::regclass),
                    (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.project_comments'::regclass),
                    has_table_privilege('anon', 'public.project_vote_totals', 'SELECT'),
                    NOT has_table_privilege('anon', 'public.project_votes', 'SELECT'),
                    has_table_privilege('authenticated', 'public.project_votes', 'INSERT'),
                    has_table_privilege('authenticated', 'public.creator_follows', 'INSERT'),
                    has_table_privilege('authenticated', 'public.project_comments', 'INSERT'),
                    has_table_privilege('authenticated', 'public.bookmarks', 'INSERT'),
                    (SELECT count(*) >= 10 FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('project_votes', 'creator_follows', 'project_comments'))
                """)
                checks = cursor.fetchone()
                if not all(checks):
                    raise RunnerError("Post-apply schema/RLS/grant checks failed; transaction will roll back.")
        print("Migration committed; all schema, RLS, policy, and grant postconditions passed.")
        print("Direct SQL does not create a Supabase CLI migration-history entry; reconcile before any db push.")
        return 0
    except RunnerError as exc:
        print(f"Migration not applied: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:
        state = getattr(exc, "sqlstate", None)
        detail = f" SQLSTATE {state}." if state else ""
        print(f"Database operation failed.{detail} Transaction rolled back if it had begun.", file=sys.stderr)
        return 1
    finally:
        if connection is not None:
            connection.close()

if __name__ == "__main__":
    raise SystemExit(main())
