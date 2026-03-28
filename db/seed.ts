import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(__dirname, "social-ills.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Types matching the canonical data file schema ──

interface Reformer {
  name: string;
  description: string;
  url?: string | null;
}

interface Legislation {
  name: string;
  description: string;
  direction: "positive" | "negative" | "mixed";
  jurisdiction: string;
  status?: string;
  year?: number | null;
  url?: string | null;
}

interface StructurallyIncentivized {
  name: string;
  description: string;
  mechanism: string;
  url?: string | null;
}

interface ReformInOtherSystems {
  name: string;
  description: string;
  country: string;
  outcome: string;
  year?: number | null;
  url?: string | null;
}

interface Issue {
  name: string;
  description: string;
  status: string;
  phase: string;
  confidence: string;
  reformers?: Reformer[];
  legislation?: Legislation[];
  structurally_incentivized?: StructurallyIncentivized[];
  reform_in_other_systems?: ReformInOtherSystems[];
}

interface DataFile {
  category: string;
  slug: string;
  structural_observation: string;
  issues: Issue[];
}

// ── Tag detection ──

const TAG_KEYWORDS: Record<string, string[]> = {
  privacy: ["surveillance", "privacy", "tracking", "data", "monitoring", "encrypt"],
  labor: ["labor", "worker", "job", "employ", "displacement", "work", "wage", "union", "bargain", "offsh"],
  health: ["health", "mental", "sleep", "anxiety", "depression", "wellbeing", "addiction", "mortalit", "hospital", "medical", "opioid", "pharma", "patient"],
  security: ["security", "cyber", "cryptograph", "hack", "vulnerab", "weapon", "military"],
  democracy: ["democra", "election", "politic", "authoritarian", "censor", "vote", "lobby", "regulat"],
  education: ["education", "student", "learning", "school", "academic"],
  environment: ["environment", "energy", "climate", "water", "carbon", "pollution"],
  misinformation: ["misinformation", "disinformation", "fake", "deepfake", "manipulat", "propaganda", "news desert"],
  inequality: ["inequal", "concentrat", "power", "asymmetr", "gap", "divide", "disparit", "wealth", "poverty"],
  children: ["child", "youth", "adolescent", "teen", "minor", "kid", "maternal"],
  finance: ["financ", "bank", "trading", "market", "crypto", "bitcoin", "debt", "buyout", "equity", "leverag", "buyback"],
  ethics: ["ethic", "consent", "bias", "discriminat", "fairness"],
  housing: ["housing", "rent", "landlord", "homeowner", "foreclos", "evict"],
  media: ["media", "journalism", "news", "reporter", "editorial", "paywall", "pundit"],
  immigration: ["immigra", "migrant", "border", "asylum", "undocument", "visa", "refugee"],
  corruption: ["corrupt", "lobbying", "revolving door", "capture", "loophole", "exploit"],
  insurance: ["insurance", "insurer", "uninsured", "underinsured", "coverage", "premium", "deductible"],
};

function detectTags(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const matched: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(tag);
    }
  }
  return matched;
}

// ── Prepared statements for child relation inserts ──

const insertReformer = sqlite.prepare(
  `INSERT INTO reformers (issue_id, name, description, url, created_at) VALUES (?, ?, ?, ?, ?)`
);

const insertLegislation = sqlite.prepare(
  `INSERT INTO legislation (issue_id, name, description, direction, jurisdiction, status, year, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const insertStructurallyIncentivized = sqlite.prepare(
  `INSERT INTO structurally_incentivized (issue_id, name, description, mechanism, url, created_at) VALUES (?, ?, ?, ?, ?, ?)`
);

const insertReformInOtherSystems = sqlite.prepare(
  `INSERT INTO reform_in_other_systems (issue_id, name, description, country, outcome, year, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

// ── Main seed function ──

function seed() {
  console.log("Seeding database...\n");

  const dataDir = path.join(__dirname, "..", "data");

  // Discover all data files (exclude SCHEMA.md and non-JSON)
  const dataFiles = fs.readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dataDir, f));

  if (dataFiles.length === 0) {
    console.error("No data files found in", dataDir);
    process.exit(1);
  }

  // Parse all files
  const allData: DataFile[] = dataFiles.map((f) => {
    const raw = fs.readFileSync(f, "utf-8");
    const data = JSON.parse(raw) as DataFile;
    if (!data.category || !data.slug || !data.issues) {
      console.error(`Invalid data file: ${path.basename(f)} — missing category, slug, or issues`);
      process.exit(1);
    }
    return data;
  });

  // 1. Create tags
  const allTagNames = new Set<string>();
  const tagMap = new Map<string, number>();

  for (const data of allData) {
    for (const issue of data.issues) {
      detectTags(issue.name, issue.description).forEach((t) => allTagNames.add(t));
    }
  }

  for (const tagName of allTagNames) {
    const result = db
      .insert(schema.tags)
      .values({ name: tagName, slug: slugify(tagName) })
      .returning()
      .get();
    tagMap.set(tagName, result.id);
  }
  console.log(`Tags: ${tagMap.size}`);

  // 2. Process each category file
  let totalIssues = 0;
  let totalChildren = 0;
  const now = new Date().toISOString();

  for (const data of allData) {
    // Create category
    const category = db
      .insert(schema.categories)
      .values({
        name: data.category,
        slug: data.slug,
        description: data.structural_observation,
      })
      .returning()
      .get();

    let fileChildren = 0;

    for (const item of data.issues) {
      // Insert issue
      const issue = db
        .insert(schema.issues)
        .values({
          name: item.name,
          slug: slugify(item.name),
          description: item.description,
          status: item.status,
          phase: item.phase,
          confidence: item.confidence,
          originalRank: data.issues.indexOf(item) + 1,
        })
        .returning()
        .get();

      // Link to category
      db.insert(schema.issueCategories)
        .values({ issueId: issue.id, categoryId: category.id })
        .run();

      // Detect and link tags
      for (const tagName of detectTags(item.name, item.description)) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          db.insert(schema.issueTags)
            .values({ issueId: issue.id, tagId })
            .run();
        }
      }

      // Create ranking row (unscored)
      db.insert(schema.rankings)
        .values({ issueId: issue.id, source: "seed" })
        .run();

      // ── Insert child relations ──

      if (item.reformers?.length) {
        for (const r of item.reformers) {
          insertReformer.run(issue.id, r.name, r.description, r.url || null, now);
        }
        fileChildren += item.reformers.length;
      }

      if (item.legislation?.length) {
        for (const l of item.legislation) {
          insertLegislation.run(
            issue.id, l.name, l.description, l.direction,
            l.jurisdiction, l.status || "passed", l.year || null, l.url || null, now
          );
        }
        fileChildren += item.legislation.length;
      }

      if (item.structurally_incentivized?.length) {
        for (const s of item.structurally_incentivized) {
          insertStructurallyIncentivized.run(
            issue.id, s.name, s.description, s.mechanism, s.url || null, now
          );
        }
        fileChildren += item.structurally_incentivized.length;
      }

      if (item.reform_in_other_systems?.length) {
        for (const r of item.reform_in_other_systems) {
          insertReformInOtherSystems.run(
            issue.id, r.name, r.description, r.country, r.outcome, r.year || null, r.url || null, now
          );
        }
        fileChildren += item.reform_in_other_systems.length;
      }

      totalIssues++;
    }

    totalChildren += fileChildren;
    const childStr = fileChildren > 0 ? ` (${fileChildren} child records)` : "";
    console.log(`  ${data.category}: ${data.issues.length} issues${childStr}`);
  }

  console.log(`\nTotal: ${totalIssues} issues, ${totalChildren} child records`);
  console.log("Seed complete!");
}

seed();
