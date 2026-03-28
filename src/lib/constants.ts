export const STATUS_COLORS: Record<string, string> = {
  present: "bg-red-100 text-red-800 border-red-200",
  emerging: "bg-amber-100 text-amber-800 border-amber-200",
  approaching: "bg-orange-100 text-orange-800 border-orange-200",
  future: "bg-blue-100 text-blue-800 border-blue-200",
  possible: "bg-slate-100 text-slate-800 border-slate-200",
};

export const STATUS_LABELS: Record<string, string> = {
  present: "Present",
  emerging: "Emerging",
  approaching: "Approaching",
  future: "Future",
  possible: "Possible",
};

export const PHASE_COLORS: Record<string, string> = {
  already_present: "bg-red-50 text-red-700 border-red-200",
  arriving_or_structurally_inevitable: "bg-orange-50 text-orange-700 border-orange-200",
  near_term_high_confidence: "bg-amber-50 text-amber-700 border-amber-200",
  medium_term_structurally_likely: "bg-yellow-50 text-yellow-700 border-yellow-200",
  longer_term_structurally_important: "bg-blue-50 text-blue-700 border-blue-200",
};

export const PHASE_LABELS: Record<string, string> = {
  already_present: "Already Present",
  arriving_or_structurally_inevitable: "Arriving / Structurally Inevitable",
  near_term_high_confidence: "Near-term (High Confidence)",
  medium_term_structurally_likely: "Medium-term (Structurally Likely)",
  longer_term_structurally_important: "Longer-term (Structurally Important)",
};

export const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-800 border-gray-200",
};

export const RANKING_DIMENSIONS = [
  { key: "severity", label: "Severity", color: "bg-red-500" },
  { key: "urgency", label: "Urgency", color: "bg-orange-500" },
  { key: "tractability", label: "Tractability", color: "bg-green-500" },
  { key: "populationAffected", label: "Population Affected", color: "bg-blue-500" },
  { key: "reversibility", label: "Reversibility", color: "bg-cyan-500" },
  { key: "visibility", label: "Visibility", color: "bg-yellow-500" },
  { key: "institutionalCapture", label: "Institutional Capture", color: "bg-rose-500" },
  { key: "compositeScore", label: "Composite Score", color: "bg-purple-500" },
] as const;

export const SORT_OPTIONS = [
  { value: "composite_score", label: "Composite Score" },
  { value: "severity", label: "Severity" },
  { value: "urgency", label: "Urgency" },
  { value: "tractability", label: "Tractability" },
  { value: "population_affected", label: "Population Affected" },
  { value: "original_rank", label: "Original Rank" },
  { value: "name", label: "Name" },
] as const;

export const LEGISLATION_ERA_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  historical: "Historical",
};

export const LEGISLATION_STATUS_COLORS: Record<string, string> = {
  passed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  stalled: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  in_debate: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  vetoed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  expired: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
  vacated: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  proposed: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
};

export const LEGISLATION_STATUS_LABELS: Record<string, string> = {
  passed: "Passed",
  stalled: "Stalled",
  in_debate: "In Debate",
  vetoed: "Vetoed",
  expired: "Expired",
  vacated: "Vacated",
  proposed: "Proposed",
};

export const LEGISLATION_DIRECTION_COLORS: Record<string, string> = {
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-red-500 dark:text-red-400",
  mixed: "text-amber-600 dark:text-amber-400",
};

export const LEGISLATION_DIRECTION_LABELS: Record<string, string> = {
  positive: "Protective",
  negative: "Harmful",
  mixed: "Mixed Impact",
};

export const DIRECTNESS_LABELS: Record<string, string> = {
  direct: "Direct",
  contributing: "Contributing",
  contextual: "Contextual",
};

export const DIRECTNESS_DESCRIPTIONS: Record<string, string> = {
  direct: "A proximate cause — removing this factor would substantially reduce the downstream harm",
  contributing: "A meaningful factor alongside others — this feeds the problem but isn't the sole driver",
  contextual: "Creates conditions that make the harm more likely or worse, but the causal link is structural rather than proximate",
};

export const DIRECTNESS_COLORS: Record<string, string> = {
  direct: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  contributing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  contextual: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
};

export const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  causes: "Causes",
  amplifies: "Amplifies",
  mitigates: "Mitigates",
  blocks: "Blocks",
  enables: "Enables",
  co_occurs: "Co-occurs with",
};

export const RELATIONSHIP_TYPE_COLORS: Record<string, string> = {
  causes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  amplifies: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  mitigates: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  blocks: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  enables: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  co_occurs: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  academic_paper: "Academic Paper",
  news_article: "News Article",
  government_report: "Government Report",
  dataset: "Dataset",
  legal_filing: "Legal Filing",
  first_person_account: "First-person Account",
  other: "Other",
};

export const EVIDENCE_TYPE_ICONS: Record<string, string> = {
  academic_paper: "GraduationCap",
  news_article: "Newspaper",
  government_report: "Landmark",
  dataset: "Database",
  legal_filing: "Scale",
  first_person_account: "User",
  other: "FileText",
};

export const ACTOR_ROLE_LABELS: Record<string, string> = {
  perpetuator: "Perpetuator",
  profiteer: "Profiteer",
  enabler: "Enabler",
  reformer: "Reformer",
  regulator: "Regulator",
  researcher: "Researcher",
};

export const ACTOR_ROLE_COLORS: Record<string, string> = {
  perpetuator: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  profiteer: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  enabler: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  reformer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  regulator: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  researcher: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export const ACTOR_TYPE_LABELS: Record<string, string> = {
  corporation: "Corporation",
  nonprofit: "Nonprofit",
  government_body: "Government Body",
  individual: "Individual",
  industry_group: "Industry Group",
  international_org: "International Org",
};

export const GEOGRAPHY_SCOPE_LABELS: Record<string, string> = {
  global: "Global",
  regional: "Regional",
  national: "National",
  subnational: "Subnational",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "artificial-intelligence": "Brain",
  "quantum-computing": "Atom",
  "smartphones-social-media": "Smartphone",
  "healthcare-system": "HeartPulse",
  "private-equity-financialization": "TrendingDown",
  "immigration": "Globe",
  "media-ecosystem-decay": "Newspaper",
  "offshoring": "Ship",
};
