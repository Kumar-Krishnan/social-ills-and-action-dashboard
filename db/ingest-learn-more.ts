/**
 * Ingest script for "learn more" articles.
 *
 * Reads .js files that export { issue: "...", text: `...` }
 * and links the markdown content to the matching issue.
 *
 * Usage:
 *   npx tsx db/ingest-learn-more.ts                       # all .js files from ../uningested/
 *   npx tsx db/ingest-learn-more.ts path/to/file.js       # single file
 *   npx tsx db/ingest-learn-more.ts path/to/directory/     # all .js files in directory
 */

import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";

const dbPath = path.join(__dirname, "social-ills.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

function findIssueByName(name: string): { id: number; name: string } | null {
  let row = sqlite
    .prepare(`SELECT id, name FROM issues WHERE name = ?`)
    .get(name) as { id: number; name: string } | undefined;
  if (row) return row;

  row = sqlite
    .prepare(`SELECT id, name FROM issues WHERE LOWER(name) = LOWER(?)`)
    .get(name) as { id: number; name: string } | undefined;
  if (row) return row;

  row = sqlite
    .prepare(`SELECT id, name FROM issues WHERE name LIKE ?`)
    .get(`%${name.slice(0, 40)}%`) as { id: number; name: string } | undefined;
  return row || null;
}

function parseJsFile(filePath: string): { issue: string; text: string } | null {
  const raw = fs.readFileSync(filePath, "utf-8");

  // Execute the JS to extract the data object
  const sandbox: { data?: { issue: string; text: string } } = {};
  try {
    vm.runInNewContext(raw.replace(/^const data =/, "this.data ="), sandbox);
  } catch {
    // Try alternate patterns
    try {
      vm.runInNewContext(raw.replace(/^module\.exports\s*=/, "this.data ="), sandbox);
    } catch {
      try {
        vm.runInNewContext(raw.replace(/^export default/, "this.data ="), sandbox);
      } catch {
        return null;
      }
    }
  }

  if (!sandbox.data?.issue || !sandbox.data?.text) return null;
  return sandbox.data;
}

function ingestFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  const data = parseJsFile(filePath);

  if (!data) {
    console.error(`  SKIP ${basename}: could not parse file or missing issue/text`);
    return false;
  }

  const issue = findIssueByName(data.issue);
  if (!issue) {
    console.error(`  SKIP ${basename}: no matching issue for "${data.issue}"`);
    return false;
  }

  // Upsert: delete existing learn_more for this issue, then insert
  sqlite.prepare(`DELETE FROM learn_more WHERE issue_id = ?`).run(issue.id);
  sqlite
    .prepare(`INSERT INTO learn_more (issue_id, content, created_at) VALUES (?, ?, ?)`)
    .run(issue.id, data.text, new Date().toISOString());

  const wordCount = data.text.split(/\s+/).length;
  console.log(`  -> "${issue.name}" — ${wordCount} words`);
  return true;
}

function main() {
  const arg = process.argv[2];
  const defaultDir = path.join(__dirname, "..", "..", "uningested");

  let files: string[] = [];

  if (arg) {
    const resolved = path.resolve(arg);
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      files = fs
        .readdirSync(resolved)
        .filter((f) => f.endsWith(".js"))
        .map((f) => path.join(resolved, f));
    } else {
      files = [resolved];
    }
  } else {
    if (!fs.existsSync(defaultDir)) {
      console.error(`No uningested directory found at ${defaultDir}`);
      process.exit(1);
    }
    files = fs
      .readdirSync(defaultDir)
      .filter((f) => f.endsWith(".js"))
      .map((f) => path.join(defaultDir, f));
  }

  if (files.length === 0) {
    console.log("No .js files to ingest.");
    return;
  }

  console.log(`Ingesting ${files.length} learn_more file(s)...\n`);

  const ingestedDir = path.join(
    arg && fs.statSync(path.resolve(arg)).isDirectory()
      ? path.resolve(arg)
      : defaultDir,
    "..",
    "ingested"
  );

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    console.log(`Processing: ${path.basename(file)}`);
    const ok = ingestFile(file);

    if (ok) {
      if (!fs.existsSync(ingestedDir)) {
        fs.mkdirSync(ingestedDir, { recursive: true });
      }
      fs.renameSync(file, path.join(ingestedDir, path.basename(file)));
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
