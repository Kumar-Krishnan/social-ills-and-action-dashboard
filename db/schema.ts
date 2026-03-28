import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Phase 1 tables

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const issues = sqliteTable("issues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  status: text("status").notNull(), // present, emerging, approaching, future, possible
  phase: text("phase"), // already_present, arriving_or_structurally_inevitable, near_term_high_confidence, medium_term_structurally_likely, longer_term_structurally_important
  confidence: text("confidence"), // high, medium, low
  originalRank: integer("original_rank").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const issueCategories = sqliteTable("issue_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  description: text("description"),
});

export const issueTags = sqliteTable("issue_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const rankings = sqliteTable("rankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  severity: real("severity"),
  urgency: real("urgency"),
  tractability: real("tractability"),
  populationAffected: real("population_affected"),
  reversibility: real("reversibility"),           // can this be undone?
  visibility: real("visibility"),                 // is the harm widely recognized?
  institutionalCapture: real("institutional_capture"), // are the fixers compromised?
  compositeScore: real("composite_score"),
  source: text("source").notNull().default("seed"), // seed, community, editorial
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Issue child relations

export const reformers = sqliteTable("reformers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Legacy legislation tables (kept for backward compatibility with ingested data)
export const positiveLegislation = sqliteTable("positive_legislation", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  jurisdiction: text("jurisdiction"),
  year: integer("year"),
  era: text("era").notNull().default("historical"),
  status: text("status").notNull().default("passed"),
  url: text("url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const negativeLegislation = sqliteTable("negative_legislation", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  jurisdiction: text("jurisdiction"),
  year: integer("year"),
  era: text("era").notNull().default("historical"),
  status: text("status").notNull().default("passed"),
  url: text("url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Unified legislation table (replaces positive_legislation + negative_legislation for new data)
export const legislation = sqliteTable("legislation", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  direction: text("direction").notNull(), // positive, negative, mixed
  jurisdiction: text("jurisdiction"),
  year: integer("year"),
  era: text("era").notNull().default("historical"), // ongoing, historical
  status: text("status").notNull().default("passed"), // passed, stalled, in_debate, vetoed, expired, vacated, proposed
  url: text("url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const structurallyIncentivized = sqliteTable("structurally_incentivized", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  mechanism: text("mechanism"),
  url: text("url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const reformInOtherSystems = sqliteTable("reform_in_other_systems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  country: text("country").notNull(),
  outcome: text("outcome"),
  year: integer("year"),
  url: text("url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const learnMore = sqliteTable("learn_more", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // markdown
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ── NEW: Causal graph ──

export const issueRelationships = sqliteTable("issue_relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceIssueId: integer("source_issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  targetIssueId: integer("target_issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type").notNull(), // causes, amplifies, mitigates, blocks, enables, co_occurs
  directness: text("directness").notNull().default("contributing"), // direct, contributing, contextual
  direction: text("direction").notNull().default("one_way"), // one_way, mutual
  evidence: text("evidence"),
  source: text("source").notNull().default("seed"), // seed, community, editorial
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ── NEW: Evidence & citations ──

export const evidence = sqliteTable("evidence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // academic_paper, news_article, government_report, dataset, legal_filing, first_person_account, other
  title: text("title").notNull(),
  url: text("url"),
  publisher: text("publisher"),
  datePublished: text("date_published"),
  snippet: text("snippet"),
  verified: integer("verified").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ── NEW: Geographic scope ──

export const issueGeographies = sqliteTable("issue_geographies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  scope: text("scope").notNull(), // global, regional, national, subnational
  region: text("region"), // North America, EU, East Asia, etc.
  country: text("country"), // ISO 3166 or display name
  notes: text("notes"),
});

// ── NEW: Issue status history ──

export const issueStatusHistory = sqliteTable("issue_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  field: text("field").notNull(), // status, phase, confidence
  oldValue: text("old_value"),
  newValue: text("new_value").notNull(),
  reason: text("reason"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ── NEW: Ranking snapshots ──

export const rankingSnapshots = sqliteTable("ranking_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  severity: real("severity"),
  urgency: real("urgency"),
  tractability: real("tractability"),
  populationAffected: real("population_affected"),
  reversibility: real("reversibility"),
  visibility: real("visibility"),
  institutionalCapture: real("institutional_capture"),
  compositeScore: real("composite_score"),
  voteCount: integer("vote_count"),
  source: text("source").notNull(), // community, editorial
  snapshotDate: text("snapshot_date").notNull(),
});

// Phase 2 tables — enhanced actors

export const actors = sqliteTable("actors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // corporation, nonprofit, government_body, individual, industry_group, international_org
  description: text("description"),
  website: text("website"),
  country: text("country"),
  sector: text("sector"), // tech, finance, healthcare, media, government, etc.
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const actorIssueLinks = sqliteTable("actor_issue_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: integer("actor_id")
    .notNull()
    .references(() => actors.id, { onDelete: "cascade" }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // perpetuator, profiteer, enabler, reformer, regulator, researcher
  influence: real("influence"), // 0-1
  mechanism: text("mechanism"), // HOW they perpetuate or fix
  evidenceUrl: text("evidence_url"),
  source: text("source").notNull().default("seed"), // seed, community, editorial
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Phase 3 tables

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  role: text("role").notNull().default("user"), // user, moderator, admin
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const votes = sqliteTable("votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(), // severity, urgency, tractability, population_affected, reversibility, visibility, institutional_capture
  score: integer("score").notNull(), // 1-10
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  moderatorNote: text("moderator_note"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
