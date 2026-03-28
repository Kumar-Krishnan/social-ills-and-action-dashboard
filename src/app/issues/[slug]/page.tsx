import { notFound } from "next/navigation";
import Link from "next/link";
import { getIssueBySlug, getRelatedIssues } from "@/lib/queries/issues";
import { StatusBadge, PhaseBadge, ConfidenceBadge } from "@/components/issues/status-badge";
import { RankingDisplay } from "@/components/issues/ranking-display";
import { IssueCard } from "@/components/issues/issue-card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ExternalLink, Gavel, AlertOctagon, ArrowRight,
  MapPin, Clock, Users, FileText, GraduationCap, Newspaper,
  Landmark, Database, Scale, User, BookOpen, CheckCircle,
} from "lucide-react";
import {
  LEGISLATION_STATUS_COLORS, LEGISLATION_STATUS_LABELS,
  LEGISLATION_DIRECTION_COLORS, LEGISLATION_DIRECTION_LABELS,
  RELATIONSHIP_TYPE_LABELS, RELATIONSHIP_TYPE_COLORS,
  DIRECTNESS_LABELS, DIRECTNESS_DESCRIPTIONS, DIRECTNESS_COLORS,
  EVIDENCE_TYPE_LABELS, ACTOR_ROLE_LABELS, ACTOR_ROLE_COLORS,
  ACTOR_TYPE_LABELS, GEOGRAPHY_SCOPE_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { LearnMore } from "@/components/issues/learn-more";
import type { Legislation, UnifiedLegislation, IssueRelationship, Evidence as EvidenceType, ActorLink } from "@/lib/types";
import { RelationshipRow } from "@/components/issues/relationship-row";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);
  if (!issue) return { title: "Not Found" };
  return {
    title: `${issue.name} | Social Ills Tracker`,
    description: issue.description,
  };
}

/* ── Shared sub-component for legacy legislation sections ── */

function LegacyLegislationSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Legislation[];
}) {
  const ongoing = items.filter((l) => l.era === "ongoing");
  const historical = items.filter((l) => l.era === "historical");

  function LegislationCard({ l }: { l: Legislation }) {
    return (
      <div className="py-4 border-b border-border/40 last:border-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-medium text-[15px]">{l.name}</h4>
          {l.url && (
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded ${LEGISLATION_STATUS_COLORS[l.status] || ""}`}>
            {LEGISLATION_STATUS_LABELS[l.status] || l.status}
          </span>
          {l.jurisdiction && <span className="text-xs text-muted-foreground">{l.jurisdiction}</span>}
          {l.year && <span className="text-xs text-muted-foreground">{l.year}</span>}
        </div>
        {l.description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{l.description}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {ongoing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Active / In Debate</p>
          {ongoing.map((l) => <LegislationCard key={l.id} l={l} />)}
        </div>
      )}
      {historical.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Historical</p>
          {historical.map((l) => <LegislationCard key={l.id} l={l} />)}
        </div>
      )}
    </div>
  );
}

/* ── Unified Legislation Section ── */

function UnifiedLegislationSection({ items }: { items: UnifiedLegislation[] }) {
  const positive = items.filter((l) => l.direction === "positive");
  const negative = items.filter((l) => l.direction === "negative");
  const mixed = items.filter((l) => l.direction === "mixed");

  function LegCard({ l }: { l: UnifiedLegislation }) {
    return (
      <div className="py-4 border-b border-border/40 last:border-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-medium text-[15px]">{l.name}</h4>
          {l.url && (
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className={`text-xs font-medium ${LEGISLATION_DIRECTION_COLORS[l.direction]}`}>
            {LEGISLATION_DIRECTION_LABELS[l.direction]}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${LEGISLATION_STATUS_COLORS[l.status] || ""}`}>
            {LEGISLATION_STATUS_LABELS[l.status] || l.status}
          </span>
          {l.jurisdiction && <span className="text-xs text-muted-foreground">{l.jurisdiction}</span>}
          {l.year && <span className="text-xs text-muted-foreground">{l.year}</span>}
        </div>
        {l.description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{l.description}</p>
        )}
      </div>
    );
  }

  const sections = [
    { label: "Protective", items: positive, icon: <Gavel className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: "Harmful", items: negative, icon: <AlertOctagon className="h-4 w-4 text-red-500 dark:text-red-400" /> },
    { label: "Mixed Impact", items: mixed, icon: <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" /> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Gavel className="h-5 w-5" />
        Legislation & Regulation
      </h2>
      {sections.map(({ label, items: sectionItems, icon }) =>
        sectionItems.length > 0 ? (
          <div key={label} className="mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
              {icon} {label}
            </p>
            {sectionItems.map((l) => <LegCard key={l.id} l={l} />)}
          </div>
        ) : null
      )}
    </div>
  );
}

/* ── Causal Graph Section ── */

function CausalGraphSection({
  upstreamCauses,
  downstreamEffects,
}: {
  upstreamCauses: IssueRelationship[];
  downstreamEffects: IssueRelationship[];
}) {
  if (upstreamCauses.length === 0 && downstreamEffects.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-1">Causal Graph</h2>
      <p className="text-sm text-muted-foreground mb-4">
        How this issue connects to other structural harms.
      </p>

      {upstreamCauses.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Upstream Causes</p>
          {upstreamCauses.map((rel) => (
            <RelationshipRow key={rel.id} rel={rel} direction="upstream" />
          ))}
        </div>
      )}

      {downstreamEffects.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Downstream Effects</p>
          {downstreamEffects.map((rel) => (
            <RelationshipRow key={rel.id} rel={rel} direction="downstream" />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Evidence Section ── */

const EVIDENCE_ICONS: Record<string, React.ReactNode> = {
  academic_paper: <GraduationCap className="h-3.5 w-3.5" />,
  news_article: <Newspaper className="h-3.5 w-3.5" />,
  government_report: <Landmark className="h-3.5 w-3.5" />,
  dataset: <Database className="h-3.5 w-3.5" />,
  legal_filing: <Scale className="h-3.5 w-3.5" />,
  first_person_account: <User className="h-3.5 w-3.5" />,
  other: <FileText className="h-3.5 w-3.5" />,
};

function EvidenceSection({ items }: { items: EvidenceType[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        Evidence & Citations
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {items.length} source{items.length !== 1 ? "s" : ""} documenting this issue.
      </p>
      <div className="space-y-0">
        {items.map((e) => (
          <div key={e.id} className="py-4 border-b border-border/40 last:border-0">
            <div className="flex items-start gap-2.5">
              <span className="text-muted-foreground mt-0.5 shrink-0">
                {EVIDENCE_ICONS[e.type] || EVIDENCE_ICONS.other}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-[15px] leading-snug">{e.title}</h4>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {EVIDENCE_TYPE_LABELS[e.type]}
                  </span>
                  {e.publisher && <span className="text-xs text-muted-foreground">{e.publisher}</span>}
                  {e.datePublished && <span className="text-xs text-muted-foreground">{e.datePublished}</span>}
                  {e.verified && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                {e.snippet && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{e.snippet}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Actors Section ── */

function ActorsSection({ items }: { items: ActorLink[] }) {
  if (items.length === 0) return null;

  // Group by role
  const byRole: Record<string, ActorLink[]> = {};
  for (const link of items) {
    if (!byRole[link.role]) byRole[link.role] = [];
    byRole[link.role].push(link);
  }

  const roleOrder = ["perpetuator", "profiteer", "enabler", "regulator", "reformer", "researcher"];

  return (
    <section>
      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Key Actors
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Organizations and entities connected to this issue.
      </p>

      {roleOrder.map((role) => {
        const links = byRole[role];
        if (!links || links.length === 0) return null;
        return (
          <div key={role} className="mb-6 last:mb-0">
            <p className="text-xs font-medium uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded ${ACTOR_ROLE_COLORS[role]}`}>
                {ACTOR_ROLE_LABELS[role]}
              </span>
            </p>
            {links.map((link) => (
              <div key={link.id} className="py-3 border-b border-border/30 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-[15px]">{link.actor.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {ACTOR_TYPE_LABELS[link.actor.type] || link.actor.type}
                      </span>
                      {link.actor.sector && (
                        <span className="text-xs text-muted-foreground capitalize">{link.actor.sector}</span>
                      )}
                      {link.actor.country && (
                        <span className="text-xs text-muted-foreground">{link.actor.country}</span>
                      )}
                      {link.influence && (
                        <span className="text-xs text-muted-foreground">
                          influence: {(link.influence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {link.actor.website && (
                    <a href={link.actor.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {link.mechanism && (
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{link.mechanism}</p>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}

/* ── Geographic Scope Section ── */

function GeographySection({ geographies }: { geographies: { scope: string; region: string | null; country: string | null; notes: string | null }[] }) {
  if (geographies.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Geographic Scope
      </h2>
      <div className="space-y-0">
        {geographies.map((g, i) => (
          <div key={i} className="py-3 border-b border-border/30 last:border-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {GEOGRAPHY_SCOPE_LABELS[g.scope] || g.scope}
              </Badge>
              {g.region && <span className="text-sm">{g.region}</span>}
              {g.country && <span className="text-sm font-medium">{g.country}</span>}
            </div>
            {g.notes && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{g.notes}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Status History Section ── */

function StatusHistorySection({ history }: { history: { field: string; oldValue: string | null; newValue: string; reason: string | null; createdAt: string }[] }) {
  if (history.length === 0) return null;

  const fieldLabels: Record<string, string> = {
    status: "Status",
    phase: "Phase",
    confidence: "Confidence",
    urgency: "Urgency",
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Status History
      </h2>
      <div className="relative pl-4 border-l-2 border-border/40">
        {history.map((h, i) => (
          <div key={i} className="pb-4 last:pb-0 relative">
            <div className="absolute -left-[calc(1rem+5px)] top-1.5 w-2 h-2 rounded-full bg-primary" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{fieldLabels[h.field] || h.field}</span>
              {h.oldValue && (
                <>
                  <span className="text-muted-foreground">{STATUS_LABELS[h.oldValue] || h.oldValue}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </>
              )}
              <span className="font-medium text-primary">{STATUS_LABELS[h.newValue] || h.newValue}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(h.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
              </span>
            </div>
            {h.reason && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{h.reason}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Page ── */

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);

  if (!issue) notFound();

  const relatedIssues = getRelatedIssues(issue.id, 4);

  // Determine whether we have any of the new enriched data
  const hasUnifiedLegislation = issue.legislation && issue.legislation.length > 0;
  const hasCausalGraph = (issue.upstreamCauses && issue.upstreamCauses.length > 0) || (issue.downstreamEffects && issue.downstreamEffects.length > 0);
  const hasEvidence = issue.evidence && issue.evidence.length > 0;
  const hasGeographies = issue.geographies && issue.geographies.length > 0;
  const hasStatusHistory = issue.statusHistory && issue.statusHistory.length > 0;
  const hasActorLinks = issue.actorLinks && issue.actorLinks.length > 0;

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      <Link
        href="/issues"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        All issues
      </Link>

      {/* ── Header ── */}
      <header className="mb-10">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
          <StatusBadge status={issue.status} />
          {issue.phase && <PhaseBadge phase={issue.phase} />}
          {issue.confidence && <ConfidenceBadge confidence={issue.confidence} />}
          {issue.categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="hover:text-foreground transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-[1.15] mb-6">
          {issue.name}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {issue.description}
        </p>

        {/* Geographic scope inline in header */}
        {hasGeographies && (
          <div className="flex flex-wrap gap-2 mt-4">
            {issue.geographies!.map((g, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {g.country || g.region || GEOGRAPHY_SCOPE_LABELS[g.scope]}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* ── Body sections ── */}
      <div className="space-y-12">

        {/* Causal Graph — the new centerpiece */}
        {hasCausalGraph && (
          <CausalGraphSection
            upstreamCauses={issue.upstreamCauses!}
            downstreamEffects={issue.downstreamEffects!}
          />
        )}

        {/* Learn More */}
        {issue.learnMore && <LearnMore content={issue.learnMore} />}

        {/* Rankings */}
        {issue.ranking && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Rankings</h2>
            <div className="max-w-md">
              <RankingDisplay ranking={issue.ranking} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Source: {issue.ranking.source}
            </p>
          </section>
        )}

        {/* Evidence & Citations */}
        {hasEvidence && <EvidenceSection items={issue.evidence!} />}

        {/* Key Actors */}
        {hasActorLinks && <ActorsSection items={issue.actorLinks!} />}

        {/* Unified Legislation */}
        {hasUnifiedLegislation && (
          <section>
            <UnifiedLegislationSection items={issue.legislation!} />
          </section>
        )}

        {/* Legacy Positive Legislation */}
        {issue.positiveLegislation && issue.positiveLegislation.length > 0 && (
          <section>
            <LegacyLegislationSection
              title="Positive Legislation"
              icon={<Gavel className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />}
              items={issue.positiveLegislation}
            />
          </section>
        )}

        {/* Legacy Negative Legislation */}
        {issue.negativeLegislation && issue.negativeLegislation.length > 0 && (
          <section>
            <LegacyLegislationSection
              title="Negative Legislation"
              icon={<AlertOctagon className="h-4.5 w-4.5 text-red-500/80 dark:text-red-400" />}
              items={issue.negativeLegislation}
            />
          </section>
        )}

        {/* Tags */}
        {issue.tags.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {issue.tags.map((tag) => (
                <Link key={tag.id} href={`/issues?tag=${tag.slug}`}>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
                    {tag.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reformers */}
        {issue.reformers && issue.reformers.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Reformers</h2>
            <div className="space-y-0">
              {issue.reformers.map((r) => (
                <div key={r.id} className="py-4 border-b border-border/40 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium text-[15px]">{r.name}</h4>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Structurally Incentivized */}
        {issue.structurallyIncentivized && issue.structurallyIncentivized.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-1">Structurally Incentivized</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Entities whose structural position gives them incentive to perpetuate this harm.
            </p>
            <div className="space-y-0">
              {issue.structurallyIncentivized.map((s) => (
                <div key={s.id} className="py-4 border-b border-border/40 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium text-[15px]">{s.name}</h4>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {s.mechanism && (
                    <p className="text-sm text-primary/80 dark:text-primary/70 mt-1.5 leading-relaxed italic">{s.mechanism}</p>
                  )}
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reform in Other Systems */}
        {issue.reformInOtherSystems && issue.reformInOtherSystems.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-1">Reform in Other Systems</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Models from other countries we could learn from.
            </p>
            <div className="space-y-0">
              {issue.reformInOtherSystems.map((r) => (
                <div key={r.id} className="py-4 border-b border-border/40 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-primary">{r.country}</span>
                        {r.year && <span className="text-xs text-muted-foreground">{r.year}</span>}
                      </div>
                      <h4 className="font-medium text-[15px]">{r.name}</h4>
                    </div>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.description}</p>
                  )}
                  {r.outcome && (
                    <p className="text-sm text-primary/80 dark:text-primary/70 mt-1.5 leading-relaxed italic">{r.outcome}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Geographic Scope (full detail) */}
        {hasGeographies && <GeographySection geographies={issue.geographies!} />}

        {/* Status History */}
        {hasStatusHistory && <StatusHistorySection history={issue.statusHistory!} />}

        {/* Related Issues */}
        {relatedIssues.length > 0 && (
          <section className="pt-4 border-t border-border/40">
            <h2 className="text-xl font-semibold mb-6">Related</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedIssues.map((related) => (
                <IssueCard key={related.id} issue={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
