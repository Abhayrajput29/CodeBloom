#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { constants, copyFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const shell = isWindows;

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    shell,
    ...options,
  });
}

function fail(message) {
  console.error(`\nCodeBloom setup: ${message}`);
  process.exit(1);
}

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  fail(`Node.js 20.9 or later is required; found ${process.versions.node}. Install or switch Node.js, then rerun this script.`);
}

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const pinnedPnpm = packageJson.packageManager?.match(/^pnpm@(.+)$/)?.[1];
if (!pinnedPnpm) fail("package.json must declare an exact pnpm version in packageManager.");
if (!existsSync(resolve(root, "pnpm-lock.yaml"))) fail("pnpm-lock.yaml is missing; refusing an unlocked install.");

const corepackCommand = isWindows ? "corepack.cmd" : "corepack";
const pnpmCommand = isWindows ? "pnpm.cmd" : "pnpm";
const corepackAvailable = run(corepackCommand, ["--version"], { stdio: "ignore" }).status === 0;
let command;
let prefix;

if (corepackAvailable) {
  command = corepackCommand;
  prefix = ["pnpm"];
  console.log(`Using Corepack to select the repository-pinned pnpm@${pinnedPnpm}.`);
} else {
  const pnpmVersion = run(pnpmCommand, ["--version"]);
  if (pnpmVersion.status !== 0) {
    fail(`Corepack and pnpm were not found. Install Node.js 20.9+ with Corepack, or install pnpm@${pinnedPnpm}, then rerun.`);
  }
  const installedPnpm = pnpmVersion.stdout.trim();
  if (installedPnpm !== pinnedPnpm) {
    fail(`This repository pins pnpm@${pinnedPnpm}, but pnpm@${installedPnpm} is installed. Enable Corepack or install the pinned pnpm version, then rerun.`);
  }
  command = pnpmCommand;
  prefix = [];
}

console.log("Installing locked dependencies. First-time setup may need access to the package registry.");
const install = run(command, [...prefix, "install", "--frozen-lockfile"], { stdio: "inherit" });
if (install.error) fail(`Could not start the package manager: ${install.error.message}`);
if (install.status !== 0) fail(`Dependency installation failed with exit code ${install.status ?? "unknown"}. Review the package-manager output and retry.`);

const envExample = resolve(root, ".env.example");
const envLocal = resolve(root, ".env.local");
if (!existsSync(envExample)) fail(".env.example is missing; dependencies installed, but no local environment template is available.");
try {
  copyFileSync(envExample, envLocal, constants.COPYFILE_EXCL);
  console.log("Created .env.local from the empty-safe template. Add Supabase values only if you need the partial service-backed features.");
} catch (error) {
  if (error?.code === "EEXIST") {
    console.log("Kept the existing .env.local unchanged.");
  } else {
    fail(`Dependencies installed, but .env.local could not be initialized: ${error.message}`);
  }
}

console.log("Setup complete. Start the app with: pnpm dev");
