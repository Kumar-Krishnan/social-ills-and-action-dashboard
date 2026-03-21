/**
 * Ingest script for child relation data.
 *
 * Reads JSON files from a source directory (default: ../uningested/)
 * Each file should have the shape:
 * {
 *   "issue": { "name": "...", "description": "..." },
 *   "reformers": [{ name, description?, url? }],
 *   "positive_legislation": [{ name, description?, jurisdiction?, year?, url? }],
 *   "negative_legislation": [{ name, description?, jurisdiction?, year?, url? }],
 *   "structurally_incentivized": [{ name, description?, mechanism?, url? }],
 *   "reform_in_other_systems": [{ name, description?, country, outcome?, year?, url? }]
 * }
 *
 * Usage:
 *   npx tsx db/ingest.ts                          # ingest all files from ../uningested/
 *   npx tsx db/ingest.ts path/to/file.json        # ingest a single file
 *   npx tsx db/ingest.ts path/to/directory/        # ingest all .json files in directory
 */

import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(__dirname, "social-ills.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

interface IngestFile {
  issue: {
    name: string;
    description?: string;
  };
  reformers?: Array<{
    name: string;
    description?: string;
    url?: string | null;
  }>;
  positive_legislation?: Array<{
    name: string;
    description?: string;
    jurisdiction?: string;
    year?: number | null;
    era?: string;
    status?: string;
    url?: string | null;
  }>;
  negative_legislation?: Array<{
    name: string;
    description?: string;
    jurisdiction?: string;
    year?: number | null;
    era?: string;
    status?: string;
    url?: string | null;
  }>;
  structurally_incentivized?: Array<{
    name: string;
    description?: string;
    mechanism?: string;
    url?: string | null;
  }>;
  reform_in_other_systems?: Array<{
    name: string;
    description?: string;
    country: string;
    outcome?: string;
    year?: number | null;
    url?: string | null;
  }>;
}

function findIssueByName(name: string): { id: number; name: string } | null {
  // Try exact match first
  let row = sqlite
    .prepare(`SELECT id, name FROM issues WHERE name = ?`)
    .get(name) as { id: number; name: string } | undefined;

  if (row) return row;

  // Try case-insensitive match
  row = sqlite
    .prepare(`SELECT id, name FROM issues WHERE LOWER(name) = LOWER(?)`)
    .get(name) as { id: number; name: string } | undefined;

  if (row) return row;

  // Try fuzzy LIKE match
  row = sqlite
    .prepare(`SELECT id, name FROM issues WHERE name LIKE ?`)
    .get(`%${name.slice(0, 40)}%`) as { id: number; name: string } | undefined;

  return row || null;
}

function ingestFile(filePath: string): { success: boolean; issue: string; counts: Record<string, number> } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: IngestFile = JSON.parse(raw);

  if (!data.issue?.name) {
    console.error(`  SKIP ${path.basename(filePath)}: missing issue.name`);
    return { success: false, issue: "unknown", counts: {} };
  }

  const issue = findIssueByName(data.issue.name);
  if (!issue) {
    console.error(`  SKIP ${path.basename(filePath)}: no matching issue for "${data.issue.name}"`);
    return { success: false, issue: data.issue.name, counts: {} };
  }

  const counts: Record<string, number> = {};

  // Reformers
  if (data.reformers?.length) {
    const stmt = sqlite.prepare(
      `INSERT INTO reformers (issue_id, name, description, url, created_at) VALUES (?, ?, ?, ?, ?)`
    );
    for (const r of data.reformers) {
      stmt.run(issue.id, r.name, r.description || null, r.url || null, new Date().toISOString());
    }
    counts.reformers = data.reformers.length;
  }

  // Positive legislation
  if (data.positive_legislation?.length) {
    const stmt = sqlite.prepare(
      `INSERT INTO positive_legislation (issue_id, name, description, jurisdiction, year, era, status, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const l of data.positive_legislation) {
      stmt.run(issue.id, l.name, l.description || null, l.jurisdiction || null, l.year || null, l.era || "historical", l.status || "passed", l.url || null, new Date().toISOString());
    }
    counts.positive_legislation = data.positive_legislation.length;
  }

  // Negative legislation
  if (data.negative_legislation?.length) {
    const stmt = sqlite.prepare(
      `INSERT INTO negative_legislation (issue_id, name, description, jurisdiction, year, era, status, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const l of data.negative_legislation) {
      stmt.run(issue.id, l.name, l.description || null, l.jurisdiction || null, l.year || null, l.era || "historical", l.status || "passed", l.url || null, new Date().toISOString());
    }
    counts.negative_legislation = data.negative_legislation.length;
  }

  // Structurally incentivized
  if (data.structurally_incentivized?.length) {
    const stmt = sqlite.prepare(
      `INSERT INTO structurally_incentivized (issue_id, name, description, mechanism, url, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const s of data.structurally_incentivized) {
      stmt.run(issue.id, s.name, s.description || null, s.mechanism || null, s.url || null, new Date().toISOString());
    }
    counts.structurally_incentivized = data.structurally_incentivized.length;
  }

  // Reform in other systems
  if (data.reform_in_other_systems?.length) {
    const stmt = sqlite.prepare(
      `INSERT INTO reform_in_other_systems (issue_id, name, description, country, outcome, year, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of data.reform_in_other_systems) {
      stmt.run(issue.id, r.name, r.description || null, r.country, r.outcome || null, r.year || null, r.url || null, new Date().toISOString());
    }
    counts.reform_in_other_systems = data.reform_in_other_systems.length;
  }

  return { success: true, issue: issue.name, counts };
}

function main() {
  const arg = process.argv[2];
  const defaultDir = path.join(__dirname, "..", "..", "uningested");

  let files: string[] = [];

  if (arg) {
    const resolved = path.resolve(arg);
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      files = fs.readdirSync(resolved)
        .filter((f) => f.endsWith(".json"))
        .map((f) => path.join(resolved, f));
    } else {
      files = [resolved];
    }
  } else {
    if (!fs.existsSync(defaultDir)) {
      console.error(`No uningested directory found at ${defaultDir}`);
      process.exit(1);
    }
    files = fs.readdirSync(defaultDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(defaultDir, f));
  }

  if (files.length === 0) {
    console.log("No JSON files to ingest.");
    return;
  }

  console.log(`Ingesting ${files.length} file(s)...\n`);

  const ingestedDir = path.join(
    arg && fs.statSync(path.resolve(arg)).isDirectory() ? path.resolve(arg) : defaultDir,
    "..",
    "ingested"
  );

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const basename = path.basename(file);
    console.log(`Processing: ${basename}`);

    const result = ingestFile(file);

    if (result.success) {
      const parts = Object.entries(result.counts)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`);
      console.log(`  -> "${result.issue}" — ${parts.join(", ")}`);

      // Move to ingested/
      if (!fs.existsSync(ingestedDir)) {
        fs.mkdirSync(ingestedDir, { recursive: true });
      }
      fs.renameSync(file, path.join(ingestedDir, basename));
      console.log(`  -> Moved to ingested/`);
      successCount++;
    } else {
      failCount++;
    }
    console.log();
  }

  console.log(`Done. ${successCount} ingested, ${failCount} failed.`);
}

main();
