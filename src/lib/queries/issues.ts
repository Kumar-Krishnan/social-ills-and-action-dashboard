import { db } from "@/lib/db";
import type {
  IssueFilters,
  IssueWithRelations,
  Reformer,
  Legislation,
  UnifiedLegislation,
  StructurallyIncentivized,
  ReformInOtherSystems,
  IssueRelationship,
  Evidence,
  IssueGeography,
  StatusChange,
  ActorLink,
  Actor,
} from "@/lib/types";

function buildRow(row: Record<string, unknown>): Omit<IssueWithRelations, "categories" | "tags"> {
  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string,
    status: row.status as string,
    phase: (row.phase as string) || null,
    confidence: (row.confidence as string) || null,
    originalRank: row.originalRank as number,
    createdAt: row.createdAt as string,
    ranking:
      row.source != null
        ? {
            severity: (row.severity as number) ?? null,
            urgency: (row.urgency as number) ?? null,
            tractability: (row.tractability as number) ?? null,
            populationAffected: (row.populationAffected as number) ?? null,
            reversibility: (row.reversibility as number) ?? null,
            visibility: (row.visibility as number) ?? null,
            institutionalCapture: (row.institutionalCapture as number) ?? null,
            compositeScore: (row.compositeScore as number) ?? null,
            source: row.source as string,
          }
        : null,
  };
}

function attachRelations(
  row: Omit<IssueWithRelations, "categories" | "tags">
): IssueWithRelations {
  const cats = db.$client
    .prepare(
      `SELECT c.id, c.name, c.slug FROM categories c
       JOIN issue_categories ic ON ic.category_id = c.id
       WHERE ic.issue_id = ?`
    )
    .all(row.id) as Array<{ id: number; name: string; slug: string }>;

  const issueTags = db.$client
    .prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       JOIN issue_tags it ON it.tag_id = t.id
       WHERE it.issue_id = ?`
    )
    .all(row.id) as Array<{ id: number; name: string; slug: string }>;

  return { ...row, categories: cats, tags: issueTags };
}

function attachChildRelations(issue: IssueWithRelations): IssueWithRelations {
  const reformers = db.$client
    .prepare(`SELECT id, name, description, url FROM reformers WHERE issue_id = ?`)
    .all(issue.id) as Reformer[];

  // Legacy legislation tables
  const positiveLegislation = db.$client
    .prepare(`SELECT id, name, description, jurisdiction, year, era, status, url FROM positive_legislation WHERE issue_id = ?`)
    .all(issue.id) as Legislation[];

  const negativeLegislation = db.$client
    .prepare(`SELECT id, name, description, jurisdiction, year, era, status, url FROM negative_legislation WHERE issue_id = ?`)
    .all(issue.id) as Legislation[];

  // Unified legislation table
  const unifiedLegislation = db.$client
    .prepare(`SELECT id, name, description, direction, jurisdiction, year, era, status, url FROM legislation WHERE issue_id = ?`)
    .all(issue.id) as UnifiedLegislation[];

  const structurallyIncentivized = db.$client
    .prepare(`SELECT id, name, description, mechanism, url FROM structurally_incentivized WHERE issue_id = ?`)
    .all(issue.id) as StructurallyIncentivized[];

  const reformInOtherSystems = db.$client
    .prepare(`SELECT id, name, description, country, outcome, year, url FROM reform_in_other_systems WHERE issue_id = ?`)
    .all(issue.id) as ReformInOtherSystems[];

  const learnMoreRow = db.$client
    .prepare(`SELECT content FROM learn_more WHERE issue_id = ? LIMIT 1`)
    .get(issue.id) as { content: string } | undefined;

  // ── New relations ──

  // Upstream causes: issues that cause/amplify/enable THIS issue
  const upstreamRows = db.$client
    .prepare(
      `SELECT ir.id, ir.relationship_type as relationshipType, ir.strength, ir.direction, ir.evidence,
              i.id as issueId, i.name as issueName, i.slug as issueSlug, i.status as issueStatus
       FROM issue_relationships ir
       JOIN issues i ON i.id = ir.source_issue_id
       WHERE ir.target_issue_id = ?
       UNION
       SELECT ir.id, ir.relationship_type as relationshipType, ir.strength, ir.direction, ir.evidence,
              i.id as issueId, i.name as issueName, i.slug as issueSlug, i.status as issueStatus
       FROM issue_relationships ir
       JOIN issues i ON i.id = ir.target_issue_id
       WHERE ir.source_issue_id = ? AND ir.direction = 'mutual'`
    )
    .all(issue.id, issue.id) as Array<Record<string, unknown>>;

  const upstreamCauses: IssueRelationship[] = upstreamRows.map((r) => ({
    id: r.id as number,
    relationshipType: r.relationshipType as IssueRelationship["relationshipType"],
    strength: (r.strength as number) ?? null,
    direction: r.direction as "one_way" | "mutual",
    evidence: (r.evidence as string) ?? null,
    relatedIssue: {
      id: r.issueId as number,
      name: r.issueName as string,
      slug: r.issueSlug as string,
      status: r.issueStatus as string,
    },
  }));

  // Downstream effects: issues that THIS issue causes/amplifies/enables
  const downstreamRows = db.$client
    .prepare(
      `SELECT ir.id, ir.relationship_type as relationshipType, ir.strength, ir.direction, ir.evidence,
              i.id as issueId, i.name as issueName, i.slug as issueSlug, i.status as issueStatus
       FROM issue_relationships ir
       JOIN issues i ON i.id = ir.target_issue_id
       WHERE ir.source_issue_id = ?`
    )
    .all(issue.id) as Array<Record<string, unknown>>;

  const downstreamEffects: IssueRelationship[] = downstreamRows.map((r) => ({
    id: r.id as number,
    relationshipType: r.relationshipType as IssueRelationship["relationshipType"],
    strength: (r.strength as number) ?? null,
    direction: r.direction as "one_way" | "mutual",
    evidence: (r.evidence as string) ?? null,
    relatedIssue: {
      id: r.issueId as number,
      name: r.issueName as string,
      slug: r.issueSlug as string,
      status: r.issueStatus as string,
    },
  }));

  // Evidence
  const evidenceRows = db.$client
    .prepare(
      `SELECT id, type, title, url, publisher, date_published as datePublished, snippet, verified
       FROM evidence WHERE issue_id = ? ORDER BY verified DESC, date_published DESC`
    )
    .all(issue.id) as Array<Record<string, unknown>>;

  const evidenceList: Evidence[] = evidenceRows.map((e) => ({
    id: e.id as number,
    type: e.type as Evidence["type"],
    title: e.title as string,
    url: (e.url as string) ?? null,
    publisher: (e.publisher as string) ?? null,
    datePublished: (e.datePublished as string) ?? null,
    snippet: (e.snippet as string) ?? null,
    verified: (e.verified as number) === 1,
  }));

  // Geographies
  const geographies = db.$client
    .prepare(`SELECT id, scope, region, country, notes FROM issue_geographies WHERE issue_id = ?`)
    .all(issue.id) as IssueGeography[];

  // Status history
  const statusHistory = db.$client
    .prepare(
      `SELECT id, field, old_value as oldValue, new_value as newValue, reason, created_at as createdAt
       FROM issue_status_history WHERE issue_id = ? ORDER BY created_at ASC`
    )
    .all(issue.id) as StatusChange[];

  // Actor links
  const actorLinkRows = db.$client
    .prepare(
      `SELECT ail.id, ail.role, ail.influence, ail.mechanism, ail.evidence_url as evidenceUrl,
              a.id as actorId, a.name as actorName, a.slug as actorSlug, a.type as actorType,
              a.description as actorDescription, a.website as actorWebsite,
              a.country as actorCountry, a.sector as actorSector
       FROM actor_issue_links ail
       JOIN actors a ON a.id = ail.actor_id
       WHERE ail.issue_id = ?
       ORDER BY ail.influence DESC`
    )
    .all(issue.id) as Array<Record<string, unknown>>;

  const actorLinks: ActorLink[] = actorLinkRows.map((r) => ({
    id: r.id as number,
    role: r.role as ActorLink["role"],
    influence: (r.influence as number) ?? null,
    mechanism: (r.mechanism as string) ?? null,
    evidenceUrl: (r.evidenceUrl as string) ?? null,
    actor: {
      id: r.actorId as number,
      name: r.actorName as string,
      slug: r.actorSlug as string,
      type: r.actorType as Actor["type"],
      description: (r.actorDescription as string) ?? null,
      website: (r.actorWebsite as string) ?? null,
      country: (r.actorCountry as string) ?? null,
      sector: (r.actorSector as string) ?? null,
    },
  }));

  return {
    ...issue,
    reformers,
    positiveLegislation,
    negativeLegislation,
    legislation: unifiedLegislation,
    structurallyIncentivized,
    reformInOtherSystems,
    learnMore: learnMoreRow?.content || null,
    upstreamCauses,
    downstreamEffects,
    evidence: evidenceList,
    geographies,
    statusHistory,
    actorLinks,
  };
}

export function getAllIssues(filters: IssueFilters = {}): IssueWithRelations[] {
  const {
    category,
    status,
    phase,
    search,
    tag,
    sortBy = "composite_score",
    sortOrder = "desc",
    limit = 100,
    offset = 0,
  } = filters;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (category) {
    conditions.push(
      `i.id IN (SELECT ic.issue_id FROM issue_categories ic JOIN categories c ON c.id = ic.category_id WHERE c.slug = ?)`
    );
    values.push(category);
  }

  if (status) {
    conditions.push(`i.status = ?`);
    values.push(status);
  }

  if (phase) {
    conditions.push(`i.phase = ?`);
    values.push(phase);
  }

  if (search) {
    conditions.push(`(i.name LIKE ? OR i.description LIKE ?)`);
    values.push(`%${search}%`, `%${search}%`);
  }

  if (tag) {
    conditions.push(
      `i.id IN (SELECT it.issue_id FROM issue_tags it JOIN tags t ON t.id = it.tag_id WHERE t.slug = ?)`
    );
    values.push(tag);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortColumn: Record<string, string> = {
    composite_score: "r.composite_score",
    severity: "r.severity",
    urgency: "r.urgency",
    tractability: "r.tractability",
    population_affected: "r.population_affected",
    original_rank: "i.original_rank",
    name: "i.name",
  };

  const orderCol = sortColumn[sortBy] || "r.composite_score";
  const orderDir = sortOrder === "asc" ? "ASC" : "DESC";

  const query = `
    SELECT
      i.id, i.name, i.slug, i.description, i.status, i.phase, i.confidence,
      i.original_rank as originalRank, i.created_at as createdAt,
      r.severity, r.urgency, r.tractability,
      r.population_affected as populationAffected,
      r.reversibility, r.visibility,
      r.institutional_capture as institutionalCapture,
      r.composite_score as compositeScore, r.source
    FROM issues i
    LEFT JOIN rankings r ON r.issue_id = i.id AND r.source = 'seed'
    ${whereClause}
    ORDER BY ${orderCol} ${orderDir}
    LIMIT ? OFFSET ?
  `;

  values.push(limit, offset);

  const rows = db.$client
    .prepare(query)
    .all(...values) as Array<Record<string, unknown>>;

  return rows.map((row) => attachRelations(buildRow(row)));
}

export function getIssueBySlug(slug: string): IssueWithRelations | null {
  const row = db.$client
    .prepare(
      `SELECT
        i.id, i.name, i.slug, i.description, i.status, i.phase, i.confidence,
        i.original_rank as originalRank, i.created_at as createdAt,
        r.severity, r.urgency, r.tractability,
        r.population_affected as populationAffected,
        r.reversibility, r.visibility,
        r.institutional_capture as institutionalCapture,
        r.composite_score as compositeScore, r.source
      FROM issues i
      LEFT JOIN rankings r ON r.issue_id = i.id AND r.source = 'seed'
      WHERE i.slug = ?`
    )
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;
  return attachChildRelations(attachRelations(buildRow(row)));
}

export function getRelatedIssues(
  issueId: number,
  limit = 5
): IssueWithRelations[] {
  const rows = db.$client
    .prepare(
      `SELECT DISTINCT i.id, i.name, i.slug, i.description, i.status, i.phase, i.confidence,
        i.original_rank as originalRank, i.created_at as createdAt,
        r.severity, r.urgency, r.tractability,
        r.population_affected as populationAffected,
        r.reversibility, r.visibility,
        r.institutional_capture as institutionalCapture,
        r.composite_score as compositeScore, r.source
      FROM issues i
      JOIN issue_categories ic ON ic.issue_id = i.id
      LEFT JOIN rankings r ON r.issue_id = i.id AND r.source = 'seed'
      WHERE ic.category_id IN (
        SELECT category_id FROM issue_categories WHERE issue_id = ?
      )
      AND i.id != ?
      ORDER BY r.composite_score DESC
      LIMIT ?`
    )
    .all(issueId, issueId, limit) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    ...buildRow(row),
    categories: [],
    tags: [],
  }));
}

export function searchIssues(query: string, limit = 10) {
  return getAllIssues({ search: query, limit });
}
