export interface Reformer {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
}

export interface Legislation {
  id: number;
  name: string;
  description: string | null;
  jurisdiction: string | null;
  year: number | null;
  era: "ongoing" | "historical";
  status: "passed" | "stalled" | "in_debate" | "vetoed" | "expired" | "vacated" | "proposed";
  url: string | null;
}

export interface UnifiedLegislation extends Legislation {
  direction: "positive" | "negative" | "mixed";
}

export interface StructurallyIncentivized {
  id: number;
  name: string;
  description: string | null;
  mechanism: string | null;
  url: string | null;
}

export interface ReformInOtherSystems {
  id: number;
  name: string;
  description: string | null;
  country: string;
  outcome: string | null;
  year: number | null;
  url: string | null;
}

export interface IssueRelationship {
  id: number;
  relationshipType: "causes" | "amplifies" | "mitigates" | "blocks" | "enables" | "co_occurs";
  strength: number | null;
  direction: "one_way" | "mutual";
  evidence: string | null;
  relatedIssue: {
    id: number;
    name: string;
    slug: string;
    status: string;
  };
}

export interface Evidence {
  id: number;
  type: "academic_paper" | "news_article" | "government_report" | "dataset" | "legal_filing" | "first_person_account" | "other";
  title: string;
  url: string | null;
  publisher: string | null;
  datePublished: string | null;
  snippet: string | null;
  verified: boolean;
}

export interface IssueGeography {
  id: number;
  scope: "global" | "regional" | "national" | "subnational";
  region: string | null;
  country: string | null;
  notes: string | null;
}

export interface StatusChange {
  id: number;
  field: "status" | "phase" | "confidence";
  oldValue: string | null;
  newValue: string;
  reason: string | null;
  createdAt: string;
}

export interface Actor {
  id: number;
  name: string;
  slug: string;
  type: "corporation" | "nonprofit" | "government_body" | "individual" | "industry_group" | "international_org";
  description: string | null;
  website: string | null;
  country: string | null;
  sector: string | null;
}

export interface ActorLink {
  id: number;
  role: "perpetuator" | "profiteer" | "enabler" | "reformer" | "regulator" | "researcher";
  influence: number | null;
  mechanism: string | null;
  evidenceUrl: string | null;
  actor: Actor;
}

export interface IssueWithRelations {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  phase: string | null;
  confidence: string | null;
  originalRank: number;
  createdAt: string;
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  ranking: {
    severity: number | null;
    urgency: number | null;
    tractability: number | null;
    populationAffected: number | null;
    reversibility: number | null;
    visibility: number | null;
    institutionalCapture: number | null;
    compositeScore: number | null;
    source: string;
  } | null;
  reformers?: Reformer[];
  positiveLegislation?: Legislation[];
  negativeLegislation?: Legislation[];
  legislation?: UnifiedLegislation[];
  structurallyIncentivized?: StructurallyIncentivized[];
  reformInOtherSystems?: ReformInOtherSystems[];
  learnMore?: string | null;
  // New relations
  upstreamCauses?: IssueRelationship[];
  downstreamEffects?: IssueRelationship[];
  evidence?: Evidence[];
  geographies?: IssueGeography[];
  statusHistory?: StatusChange[];
  actorLinks?: ActorLink[];
}

export interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  issueCount: number;
}

export interface IssueFilters {
  category?: string;
  status?: string;
  phase?: string;
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
