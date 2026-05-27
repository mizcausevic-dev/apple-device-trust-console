#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import type { ComplianceOptions, DeviceInput } from "./types.js";

type Format = "json" | "markdown" | "summary";

interface Args {
  input?: string;
  format: Format;
  now?: string;
  staleAfterDays?: number;
  failOnHigh: boolean;
  out?: string;
  help: boolean;
}

const FORMATS: Format[] = ["json", "markdown", "summary"];

function parseArgs(argv: string[]): Args {
  const args: Args = { format: "json", failOnHigh: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "-h" || value === "--help") {
      args.help = true;
    } else if (value === "--format") {
      const format = argv[++i] as Format;
      if (!FORMATS.includes(format)) {
        throw new Error(`--format must be one of: ${FORMATS.join(", ")}`);
      }
      args.format = format;
    } else if (value === "--now") {
      args.now = argv[++i];
    } else if (value === "--stale-after-days") {
      args.staleAfterDays = Number(argv[++i]);
    } else if (value === "--fail-on-high") {
      args.failOnHigh = true;
    } else if (value === "--out") {
      args.out = argv[++i];
    } else if (!value.startsWith("-")) {
      args.input = value;
    } else {
      throw new Error(`Unknown option: ${value}`);
    }
  }
  return args;
}

const HELP = `apple-device-trust-console — analyze Apple fleet export packets

Usage:
  apple-device-trust <export.json> [--format json|markdown|summary]
                                   [--now <iso>] [--stale-after-days N]
                                   [--fail-on-high] [--out FILE]

Input:
  Normalized managed-device JSON — a single device, an array, or the standard
  \`{ "value": [ ... ] }\` collection envelope.

Findings:
  - high     noncompliant-device, device-integrity-exception, missing-encryption,
             stale-checkin > 2×N days.
  - medium   in-grace-period, outdated-os-version, orphaned-device,
             stale-checkin between N and 2N days.
  - info     personal-device-with-corporate-policy.

Exit code:
  0 — no high findings (or --fail-on-high not set)
  1 — high finding AND --fail-on-high set
  2 — usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    return 2;
  }

  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let payload: DeviceInput;
  try {
    payload = JSON.parse(readFileSync(args.input, "utf8")) as DeviceInput;
  } catch (error) {
    process.stderr.write(`error reading input: ${(error as Error).message}\n`);
    return 2;
  }

  const options: ComplianceOptions = {};
  if (args.now) {
    options.now = args.now;
  }
  if (args.staleAfterDays !== undefined) {
    options.staleAfterDays = args.staleAfterDays;
  }

  const report = analyze(payload, options);

  let output: string;
  if (args.format === "json") {
    output = JSON.stringify(report, null, 2);
  } else if (args.format === "markdown") {
    output = toMarkdown(report);
  } else {
    output = toSummary(report);
  }

  if (args.out) {
    writeFileSync(args.out, `${output}\n`, "utf8");
  } else {
    process.stdout.write(`${output}\n`);
  }

  if (args.failOnHigh && !report.ok) {
    return 1;
  }
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`fatal: ${(error as Error).message}\n`);
    process.exit(2);
  }
}
