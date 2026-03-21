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

interface JsonItem {
  rank: number;
  name: string;
  description: string;
  status: string;
  phase?: string;
  confidence?: string;
}

interface JsonFile {
  title: string;
  items: JsonItem[];
  structural_observation: string;
}

// Tag keyword detection mapping
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

const DATA_FILES = [
  {
    file: "ai_social_ills.json",
    categoryName: "Artificial Intelligence",
    categorySlug: "artificial-intelligence",
  },
  {
    file: "quantum_computing_social_ills.json",
    categoryName: "Quantum Computing",
    categorySlug: "quantum-computing",
  },
  {
    file: "smartphones_social_media_ills.json",
    categoryName: "Smartphones & Social Media",
    categorySlug: "smartphones-social-media",
  },
  {
    file: "healthcare_profiteering.json",
    categoryName: "Healthcare System",
    categorySlug: "healthcare-system",
  },
  {
    file: "financilization_and_private_equity.json",
    categoryName: "Private Equity & Financialization",
    categorySlug: "private-equity-financialization",
  },
  {
    file: "immigration.json",
    categoryName: "Immigration",
    categorySlug: "immigration",
  },
  {
    file: "media_ecosyste_decay.json",
    categoryName: "Media Ecosystem Decay",
    categorySlug: "media-ecosystem-decay",
  },
  {
    file: "off-shoring.json",
    categoryName: "Offshoring",
    categorySlug: "offshoring",
  },
];

function seed() {
  console.log("Seeding database...");

  const dataDir = path.join(__dirname, "..", "data");

  // Create all tags first
  const allTagNames = new Set<string>();
  const tagMap = new Map<string, number>();

  for (const { file } of DATA_FILES) {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
    const data: JsonFile = JSON.parse(raw);
    for (const item of data.items) {
      const tags = detectTags(item.name, item.description);
      tags.forEach((t) => allTagNames.add(t));
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
  console.log(`  Created ${tagMap.size} tags`);

  // Process each data file
  let totalIssues = 0;

  for (const { file, categoryName, categorySlug } of DATA_FILES) {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
    const data: JsonFile = JSON.parse(raw);

    // Create category
    const category = db
      .insert(schema.categories)
      .values({
        name: categoryName,
        slug: categorySlug,
        description: data.structural_observation,
      })
      .returning()
      .get();

    console.log(`  Category: ${categoryName} (id=${category.id})`);

    for (const item of data.items) {
      const issueSlug = slugify(item.name);

      // Insert issue
      const issue = db
        .insert(schema.issues)
        .values({
          name: item.name,
          slug: issueSlug,
          description: item.description,
          status: item.status,
          phase: item.phase || null,
          confidence: item.confidence || null,
          originalRank: item.rank,
        })
        .returning()
        .get();

      // Link to category
      db.insert(schema.issueCategories)
        .values({ issueId: issue.id, categoryId: category.id })
        .run();

      // Detect and link tags
      const detectedTags = detectTags(item.name, item.description);
      for (const tagName of detectedTags) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          db.insert(schema.issueTags)
            .values({ issueId: issue.id, tagId })
            .run();
        }
      }

      // Create ranking row with all dimensions unscored
      db.insert(schema.rankings)
        .values({
          issueId: issue.id,
          severity: null,
          urgency: null,
          tractability: null,
          populationAffected: null,
          compositeScore: null,
          source: "seed",
        })
        .run();

      totalIssues++;
    }
  }

  console.log(`  Total issues: ${totalIssues}`);
  console.log("Seed complete!");
}

seed();
