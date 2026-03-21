/**
 * Demo seed: Fleshes out 3 issues to demonstrate the full data model.
 *
 * Run AFTER the main seed: `npm run db:seed-demo`
 *
 * Issues:
 *   1. "Algorithmic bias laundering" (AI)
 *   2. "Hospital consolidation and local monopoly pricing" (Healthcare)
 *   3. "Destruction of local journalism via hedge fund acquisition" (PE/Financialization)
 */

import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "social-ills.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const NOW = new Date().toISOString();

function getIssueId(name: string): number {
  const row = sqlite.prepare(`SELECT id FROM issues WHERE name = ?`).get(name) as { id: number } | undefined;
  if (!row) throw new Error(`Issue not found: "${name}"`);
  return row.id;
}

function getOrCreateActor(actor: {
  name: string;
  type: string;
  description: string;
  website?: string;
  country?: string;
  sector?: string;
}): number {
  const slug = slugify(actor.name);
  const existing = sqlite.prepare(`SELECT id FROM actors WHERE slug = ?`).get(slug) as { id: number } | undefined;
  if (existing) return existing.id;

  const result = sqlite
    .prepare(
      `INSERT INTO actors (name, slug, type, description, website, country, sector, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(actor.name, slug, actor.type, actor.description, actor.website || null, actor.country || null, actor.sector || null, NOW);
  return result.lastInsertRowid as number;
}

function seedDemo() {
  console.log("Seeding demo data for 3 showcase issues...\n");

  // ════════════════════════════════════════════════════════════
  // ISSUE 1: Algorithmic bias laundering
  // ════════════════════════════════════════════════════════════

  const algoId = getIssueId("Algorithmic bias laundering");
  console.log(`  [1/3] Algorithmic bias laundering (id=${algoId})`);

  // Rankings — full 7-dimension scoring
  sqlite.prepare(`UPDATE rankings SET severity = 8.5, urgency = 7.8, tractability = 4.5, population_affected = 9.2, reversibility = 3.0, visibility = 3.5, institutional_capture = 7.5, composite_score = 7.9 WHERE issue_id = ?`).run(algoId);

  // Evidence
  const algoEvidence = [
    {
      type: "academic_paper",
      title: "Dissecting racial bias in an algorithm used to manage the health of populations",
      publisher: "Science",
      datePublished: "2019-10-25",
      snippet: "A widely used algorithm to allocate health care resources systematically discriminated against Black patients. The bias arose because the algorithm used health costs as a proxy for health needs — but unequal access to care meant Black patients generated lower costs at equivalent levels of need.",
      verified: 1,
    },
    {
      type: "government_report",
      title: "Blueprint for an AI Bill of Rights",
      publisher: "White House Office of Science and Technology Policy",
      datePublished: "2022-10-04",
      snippet: "Americans should be protected from algorithmic discrimination. Systems should be designed and used in an equitable way, with protections against algorithmic discrimination based on race, color, ethnicity, sex, religion, age, national origin, disability, veteran status, genetic information, or any other classification protected by law.",
      verified: 1,
    },
    {
      type: "news_article",
      title: "Amazon scraps secret AI recruiting tool that showed bias against women",
      publisher: "Reuters",
      datePublished: "2018-10-10",
      snippet: "Amazon's machine-learning specialists discovered their recruiting engine was penalizing resumes that included the word 'women's' and downgrading graduates of two all-women's colleges. The system was trained on resumes submitted over a 10-year period, most from men.",
      verified: 1,
    },
    {
      type: "academic_paper",
      title: "Predictive Policing and the Feedback Loop: Dirty Data, Biased Predictions",
      publisher: "Yale Law Journal",
      datePublished: "2017-01-15",
      snippet: "Predictive policing systems trained on historical arrest data do not predict crime — they predict policing. Communities that were over-policed in the past generate more data, which directs more policing to those communities, creating a self-reinforcing cycle of discriminatory enforcement.",
      verified: 1,
    },
    {
      type: "news_article",
      title: "How an Algorithm Blocks Kidney Transplants for Black Patients",
      publisher: "Wired",
      datePublished: "2020-10-26",
      snippet: "A race-based correction factor in the eGFR kidney function formula systematically overstated kidney health in Black patients, delaying their placement on transplant waitlists. The algorithm was embedded in lab equipment across the country.",
      verified: 1,
    },
    {
      type: "legal_filing",
      title: "FTC Action Against Rite Aid for AI Facial Recognition Misidentification",
      publisher: "Federal Trade Commission",
      datePublished: "2023-12-19",
      snippet: "The FTC ordered Rite Aid to stop using facial recognition technology after the system disproportionately generated false-positive matches for women and people of color, leading to wrongful accusations and embarrassment.",
      verified: 1,
    },
  ];

  for (const e of algoEvidence) {
    sqlite.prepare(
      `INSERT INTO evidence (issue_id, type, title, url, publisher, date_published, snippet, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(algoId, e.type, e.title, null, e.publisher, e.datePublished, e.snippet, e.verified, NOW);
  }

  // Unified legislation
  const algoLegislation = [
    { name: "EU Artificial Intelligence Act", description: "Classifies AI systems by risk level and bans certain practices including social scoring and real-time biometric surveillance. High-risk AI systems (hiring, credit, healthcare, law enforcement) must undergo conformity assessments, bias testing, and maintain human oversight.", direction: "positive", jurisdiction: "European Union", year: 2024, era: "ongoing", status: "passed" },
    { name: "NYC Local Law 144 (Automated Employment Decision Tools)", description: "Requires employers using AI in hiring to conduct annual bias audits and publish results. First-of-its-kind algorithmic accountability law in the US.", direction: "positive", jurisdiction: "New York City", year: 2023, era: "ongoing", status: "passed" },
    { name: "Colorado SB 21-169 (Insurance AI)", description: "Requires insurers to test algorithms for unfair discrimination based on race, color, national origin, religion, sex, sexual orientation, disability, gender identity, or gender expression.", direction: "positive", jurisdiction: "Colorado", year: 2021, era: "ongoing", status: "passed" },
    { name: "Section 230 of the Communications Decency Act", description: "Provides broad immunity to platforms for algorithmic content decisions, effectively shielding AI-driven recommendation and moderation systems from accountability for discriminatory outcomes.", direction: "negative", jurisdiction: "United States", year: 1996, era: "ongoing", status: "passed" },
    { name: "Algorithmic Accountability Act (US)", description: "Would require companies to assess the impact of automated decision systems for bias, effectiveness, and fairness. Repeatedly introduced but has not passed.", direction: "positive", jurisdiction: "United States", year: 2023, era: "ongoing", status: "stalled" },
    { name: "Canada Artificial Intelligence and Data Act (AIDA)", description: "Part of Bill C-27, would create a regulatory framework for high-impact AI systems with requirements for bias mitigation and transparency.", direction: "positive", jurisdiction: "Canada", year: 2023, era: "ongoing", status: "in_debate" },
  ];

  for (const l of algoLegislation) {
    sqlite.prepare(
      `INSERT INTO legislation (issue_id, name, description, direction, jurisdiction, year, era, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(algoId, l.name, l.description, l.direction, l.jurisdiction, l.year, l.era, l.status, NOW);
  }

  // Geographies
  const algoGeos = [
    { scope: "global", region: null, country: null, notes: "AI systems are deployed globally, but bias impacts are concentrated where historical discrimination is deepest" },
    { scope: "national", region: "North America", country: "United States", notes: "Primary source of most commercial AI systems; weak federal regulatory framework; bias impacts acute in healthcare, criminal justice, and hiring" },
    { scope: "regional", region: "European Union", country: null, notes: "Most advanced regulatory framework via the AI Act; bias testing requirements for high-risk systems" },
  ];

  for (const g of algoGeos) {
    sqlite.prepare(
      `INSERT INTO issue_geographies (issue_id, scope, region, country, notes) VALUES (?, ?, ?, ?, ?)`
    ).run(algoId, g.scope, g.region, g.country, g.notes);
  }

  // Status history
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(algoId, "status", null, "emerging", "Initial assessment: bias in AI was documented but not yet structurally embedded across sectors", "2020-01-15T00:00:00.000Z");
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(algoId, "status", "emerging", "present", "Upgraded after Obermeyer et al. (Science, 2019) demonstrated bias in algorithm affecting 200M+ patients, and subsequent discovery of race-based kidney function algorithms", "2021-06-01T00:00:00.000Z");

  // Actors
  const optumId = getOrCreateActor({ name: "Optum / UnitedHealth Group", type: "corporation", description: "Largest health insurance and healthcare services company in the US. Their population health algorithm was the subject of the landmark Obermeyer bias study.", country: "US", sector: "healthcare" });
  const palantirId = getOrCreateActor({ name: "Palantir Technologies", type: "corporation", description: "Data analytics company whose predictive policing and immigration enforcement tools have faced scrutiny for encoding racial bias into law enforcement decisions.", country: "US", sector: "tech" });
  const acrId = getOrCreateActor({ name: "Algorithmic Justice League", type: "nonprofit", description: "Organization founded by Joy Buolamwini to raise awareness about the social implications of AI and advocate for equitable and accountable AI.", country: "US", sector: "tech" });
  const euCommId = getOrCreateActor({ name: "European Commission", type: "government_body", description: "Executive branch of the EU, responsible for drafting and implementing the AI Act.", country: "EU", sector: "government" });
  const ftcId = getOrCreateActor({ name: "Federal Trade Commission", type: "government_body", description: "US federal agency responsible for consumer protection. Has taken enforcement actions against companies using biased AI systems.", country: "US", sector: "government" });

  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(optumId, algoId, "perpetuator", 0.9, "Deployed population health algorithm used by hospitals nationwide that systematically underestimated health needs of Black patients by using cost as a proxy for illness severity", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(palantirId, algoId, "perpetuator", 0.7, "Builds and deploys predictive policing systems that encode historical bias in arrest data, directing more policing to already over-policed communities", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(acrId, algoId, "reformer", 0.6, "Research, advocacy, and public education on algorithmic bias; Gender Shades study exposed racial and gender bias in commercial facial recognition", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(euCommId, algoId, "regulator", 0.8, "Designed and passed the AI Act, the world's most comprehensive AI regulation framework with mandatory bias testing for high-risk systems", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(ftcId, algoId, "regulator", 0.5, "Enforcement actions against biased AI (Rite Aid facial recognition), but lacks dedicated AI legislation and relies on existing consumer protection authority", "seed", NOW);

  // Reform in other systems
  const algoReforms = [
    { name: "EU AI Act mandatory bias audits", description: "Requires pre-deployment and ongoing bias testing for high-risk AI systems in healthcare, hiring, credit, and law enforcement", country: "EU", outcome: "Too early to measure — enforcement begins 2025-2027. But the conformity assessment requirement has already changed product design decisions at major AI companies", year: 2024 },
    { name: "Brazil LGPD algorithmic review rights", description: "Brazil's data protection law grants individuals the right to request review of automated decisions that affect their interests", country: "Brazil", outcome: "Limited enforcement but has established the legal principle that automated decisions are reviewable, not final", year: 2020 },
  ];

  for (const r of algoReforms) {
    sqlite.prepare(
      `INSERT INTO reform_in_other_systems (issue_id, name, description, country, outcome, year, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(algoId, r.name, r.description, r.country, r.outcome, r.year, NOW);
  }

  // ════════════════════════════════════════════════════════════
  // ISSUE 2: Hospital consolidation and local monopoly pricing
  // ════════════════════════════════════════════════════════════

  const hospId = getIssueId("Hospital consolidation and local monopoly pricing");
  console.log(`  [2/3] Hospital consolidation and local monopoly pricing (id=${hospId})`);

  // Rankings
  sqlite.prepare(`UPDATE rankings SET severity = 8.0, urgency = 8.5, tractability = 3.5, population_affected = 8.8, reversibility = 2.5, visibility = 5.0, institutional_capture = 8.0, composite_score = 7.6 WHERE issue_id = ?`).run(hospId);

  // Evidence
  const hospEvidence = [
    {
      type: "academic_paper",
      title: "Hospital Mergers and Competitive Effects: Two Retrospective Analyses",
      publisher: "International Journal of the Economics of Business",
      datePublished: "2019-03-15",
      snippet: "Post-merger hospital prices increased by an average of 6-18% with no measurable improvement in quality of care. The price increases were largest in already-concentrated markets.",
      verified: 1,
    },
    {
      type: "government_report",
      title: "To Protect and Promote Competition in Health Care",
      publisher: "Federal Trade Commission / Department of Justice",
      datePublished: "2023-03-15",
      snippet: "DOJ and FTC issued updated merger guidelines specifically addressing healthcare consolidation. Analysis found that hospital mergers consistently result in higher prices and that quality improvements promised by merging parties rarely materialize.",
      verified: 1,
    },
    {
      type: "news_article",
      title: "How Hospital Mergers Are Draining Rural Communities",
      publisher: "The New York Times",
      datePublished: "2023-09-12",
      snippet: "When large hospital systems acquire rural hospitals, they frequently close less profitable service lines, reduce staff, and redirect complex cases to urban facilities — extracting value from rural communities while degrading local access to care.",
      verified: 1,
    },
    {
      type: "academic_paper",
      title: "The Price Effects of Cross-Market Hospital Mergers",
      publisher: "RAND Journal of Economics",
      datePublished: "2020-06-01",
      snippet: "Even when merging hospitals do not compete in the same local market, cross-market mergers lead to significant price increases of 6-12% because the combined system gains leverage over insurers who need access to both markets.",
      verified: 1,
    },
    {
      type: "dataset",
      title: "American Hospital Association Annual Survey Database",
      publisher: "American Hospital Association",
      datePublished: "2024-01-01",
      snippet: "Tracks hospital ownership changes, closures, and consolidation trends. Shows the number of independent community hospitals has declined by more than 30% since 2000.",
      verified: 1,
    },
    {
      type: "news_article",
      title: "Steward Health Care's Collapse Shows the Danger of Private Equity in Medicine",
      publisher: "The Boston Globe",
      datePublished: "2024-05-20",
      snippet: "Steward Health Care, a PE-owned hospital chain, filed for bankruptcy after years of asset stripping and debt loading, leaving communities across multiple states scrambling to keep hospitals open. The chain's real estate had been sold in a sale-leaseback deal that enriched investors while saddling hospitals with unaffordable rent.",
      verified: 1,
    },
  ];

  for (const e of hospEvidence) {
    sqlite.prepare(
      `INSERT INTO evidence (issue_id, type, title, url, publisher, date_published, snippet, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(hospId, e.type, e.title, null, e.publisher, e.datePublished, e.snippet, e.verified, NOW);
  }

  // Unified legislation
  const hospLegislation = [
    { name: "No Surprises Act", description: "Protects patients from surprise out-of-network billing, addressing one symptom of hospital market power. Does not address the underlying consolidation driving prices up.", direction: "positive", jurisdiction: "United States", year: 2022, era: "ongoing", status: "passed" },
    { name: "Certificate of Public Advantage (COPA) laws", description: "Multiple states allow hospital mergers that would otherwise violate antitrust law if the merged entity promises community benefits. In practice, COPAs have consistently failed to prevent post-merger price increases and quality declines.", direction: "negative", jurisdiction: "Multiple US States", year: 2015, era: "ongoing", status: "passed" },
    { name: "FTC-DOJ Updated Merger Guidelines", description: "Revised guidelines specifically address healthcare consolidation concerns, lowering the threshold for merger challenges and recognizing cross-market effects.", direction: "positive", jurisdiction: "United States", year: 2023, era: "ongoing", status: "passed" },
    { name: "Health Over Wealth Act (proposed)", description: "Would require private equity firms to notify regulators before acquiring healthcare facilities and hold PE owners personally liable for debts incurred through healthcare acquisitions.", direction: "positive", jurisdiction: "United States", year: 2024, era: "ongoing", status: "proposed" },
    { name: "State anti-surprise billing preemption provisions", description: "Federal No Surprises Act preempts stronger state laws in some cases, preventing states from imposing more protective consumer standards.", direction: "mixed", jurisdiction: "United States", year: 2022, era: "ongoing", status: "passed" },
  ];

  for (const l of hospLegislation) {
    sqlite.prepare(
      `INSERT INTO legislation (issue_id, name, description, direction, jurisdiction, year, era, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(hospId, l.name, l.description, l.direction, l.jurisdiction, l.year, l.era, l.status, NOW);
  }

  // Geographies
  const hospGeos = [
    { scope: "national", region: "North America", country: "United States", notes: "Hospital consolidation is overwhelmingly a US problem, driven by the unique structure of employer-based insurance and fee-for-service payment" },
    { scope: "subnational", region: "North America", country: "United States", notes: "Impact most severe in rural areas and mid-size cities where one system can dominate an entire market — e.g., Sutter Health in Northern California, HCA in multiple Southern states" },
  ];

  for (const g of hospGeos) {
    sqlite.prepare(
      `INSERT INTO issue_geographies (issue_id, scope, region, country, notes) VALUES (?, ?, ?, ?, ?)`
    ).run(hospId, g.scope, g.region, g.country, g.notes);
  }

  // Status history
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(hospId, "status", null, "emerging", "Hospital consolidation trend documented by health economists", "2015-01-01T00:00:00.000Z");
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(hospId, "status", "emerging", "present", "Post-ACA merger wave made consolidation the dominant market structure; FTC began losing merger challenges", "2018-06-01T00:00:00.000Z");
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(hospId, "confidence", null, "high", "Multiple retrospective studies now confirm price increases of 6-18% post-merger with no quality improvement", "2020-01-01T00:00:00.000Z");

  // Actors
  const hcaId = getOrCreateActor({ name: "HCA Healthcare", type: "corporation", description: "Largest for-profit hospital operator in the US (180+ hospitals). Originally taken private via PE leveraged buyout by KKR, Bain Capital, and Merrill Lynch in 2006.", country: "US", sector: "healthcare" });
  const sutterHealthId = getOrCreateActor({ name: "Sutter Health", type: "corporation", description: "Northern California health system whose market dominance led to a landmark antitrust lawsuit. Settled for $575M in 2019.", country: "US", sector: "healthcare" });
  const stewardId = getOrCreateActor({ name: "Steward Health Care / Cerberus Capital", type: "corporation", description: "PE-owned hospital chain that filed for bankruptcy in 2024 after years of asset stripping, sale-leaseback deals, and debt loading. Left communities scrambling to keep hospitals open.", country: "US", sector: "healthcare" });
  const arnoldVenturesId = getOrCreateActor({ name: "Arnold Ventures", type: "nonprofit", description: "Philanthropy funding research into hospital consolidation's effects on prices and quality. Funded key studies that documented post-merger price increases.", country: "US", sector: "healthcare" });
  const dojAntitrustId = getOrCreateActor({ name: "DOJ Antitrust Division", type: "government_body", description: "Federal enforcement authority for hospital merger review. Has challenged several mergers but faces resource constraints and legal setbacks.", country: "US", sector: "government" });

  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(hcaId, hospId, "perpetuator", 0.9, "Operates as the dominant hospital system in many Southern US markets; PE origins established the playbook of leveraged acquisition and price extraction in hospital markets", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(sutterHealthId, hospId, "perpetuator", 0.7, "Built Northern California monopoly through decades of acquisitions; used market power to negotiate prices 20-30% above comparable markets; antitrust lawsuit settled for $575M", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(stewardId, hospId, "perpetuator", 0.8, "Paradigmatic case of PE-driven hospital destruction: Cerberus acquired hospitals, sold real estate in sale-leaseback, loaded debt, cut staffing, then the chain collapsed in bankruptcy leaving communities without care", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(arnoldVenturesId, hospId, "researcher", 0.4, "Funded the academic research pipeline that produced the evidence base documenting consolidation harms — without this research, the antitrust case would be much weaker", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(dojAntitrustId, hospId, "regulator", 0.6, "Challenges anticompetitive mergers but faces resource asymmetry — hospital systems can outspend DOJ in litigation; updated merger guidelines in 2023 to address healthcare-specific harms", "seed", NOW);

  // Reform in other systems
  const hospReforms = [
    { name: "NHS single-payer eliminates consolidation incentive", description: "The UK's National Health Service operates hospitals as a public service rather than competing market entities, eliminating the consolidation-for-market-power dynamic entirely", country: "United Kingdom", outcome: "NHS faces its own problems (underfunding, wait times) but hospital monopoly pricing is not one of them — prices are set centrally", year: 1948 },
    { name: "Germany's all-payer rate setting", description: "All insurers pay the same negotiated rates for hospital services, removing the leverage advantage that consolidated hospital systems exploit in the US", country: "Germany", outcome: "Hospital prices are roughly 60% lower than US prices for comparable procedures; consolidation still occurs but cannot be weaponized for pricing power", year: 1993 },
    { name: "Maryland all-payer hospital rate regulation", description: "Maryland is the only US state that sets hospital payment rates — all insurers pay the same rate. This eliminates the market power advantage of consolidation.", country: "United States (Maryland)", outcome: "Hospital cost growth in Maryland has been below the national average since the program was modernized in 2014. The state demonstrates that all-payer rate setting works within the US system.", year: 2014 },
  ];

  for (const r of hospReforms) {
    sqlite.prepare(
      `INSERT INTO reform_in_other_systems (issue_id, name, description, country, outcome, year, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(hospId, r.name, r.description, r.country, r.outcome, r.year, NOW);
  }

  // ════════════════════════════════════════════════════════════
  // ISSUE 3: Destruction of local journalism via hedge fund acquisition
  // ════════════════════════════════════════════════════════════

  const journId = getIssueId("Destruction of local journalism via hedge fund acquisition");
  console.log(`  [3/3] Destruction of local journalism via hedge fund acquisition (id=${journId})`);

  // Rankings
  sqlite.prepare(`UPDATE rankings SET severity = 8.2, urgency = 9.0, tractability = 5.0, population_affected = 8.5, reversibility = 4.0, visibility = 6.5, institutional_capture = 6.0, composite_score = 7.8 WHERE issue_id = ?`).run(journId);

  // Evidence
  const journEvidence = [
    {
      type: "academic_paper",
      title: "Financing Dies in Darkness? The Impact of Newspaper Closures on Public Finance",
      publisher: "Journal of Financial Economics",
      datePublished: "2019-05-01",
      snippet: "Municipal borrowing costs increase by 5-11 basis points after local newspaper closures. The loss of journalistic oversight allows municipal officials to issue more debt at worse terms — an invisible tax on communities that lost their watchdog.",
      verified: 1,
    },
    {
      type: "news_article",
      title: "Alden Global Capital is making billions off of newspapers it is destroying",
      publisher: "The Washington Post",
      datePublished: "2021-02-18",
      snippet: "Alden Global Capital, a hedge fund, has acquired newspaper chains across the country, gutting newsrooms to extract cash flows. Alden's newspapers have cut staff at twice the rate of the broader industry. The strategy is not turnaround — it is managed decline for profit.",
      verified: 1,
    },
    {
      type: "government_report",
      title: "The State of Local News 2023",
      publisher: "Northwestern University Medill Local News Initiative",
      datePublished: "2023-11-01",
      snippet: "The US has lost more than 2,500 newspapers since 2005. Roughly 1,800 communities that had a local news outlet in 2004 now have none. An additional 1,766 counties have only one remaining local news source — typically a weekly paper with a skeleton staff.",
      verified: 1,
    },
    {
      type: "academic_paper",
      title: "Political Effects of Local News Closures",
      publisher: "American Political Science Review",
      datePublished: "2022-08-01",
      snippet: "Communities that lose local newspapers show measurably lower voter turnout, fewer candidates running for local office, and increased partisan polarization as residents substitute national partisan media for local reporting.",
      verified: 1,
    },
    {
      type: "news_article",
      title: "Inside the hedge fund-ification of local news",
      publisher: "Nieman Lab / Harvard",
      datePublished: "2023-04-15",
      snippet: "The business model is simple and destructive: acquire newspapers at distressed prices, cut staff to a minimum, extract remaining advertising and subscription revenue, sell the real estate, and move on. Journalism is a byproduct being stripped from the asset.",
      verified: 1,
    },
    {
      type: "academic_paper",
      title: "Local Newspaper Closures and Local Government Inefficiency",
      publisher: "National Bureau of Economic Research",
      datePublished: "2018-09-01",
      snippet: "After newspaper closures, local government wage spending increases and efficiency decreases. Without journalistic oversight, government officials face less accountability for budget decisions.",
      verified: 1,
    },
  ];

  for (const e of journEvidence) {
    sqlite.prepare(
      `INSERT INTO evidence (issue_id, type, title, url, publisher, date_published, snippet, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(journId, e.type, e.title, null, e.publisher, e.datePublished, e.snippet, e.verified, NOW);
  }

  // Unified legislation
  const journLegislation = [
    { name: "Local Journalism Sustainability Act (proposed)", description: "Would provide tax credits for subscribing to local newspapers, hiring local journalists, and advertising in local outlets. Repeatedly introduced but never passed.", direction: "positive", jurisdiction: "United States", year: 2023, era: "ongoing", status: "stalled" },
    { name: "Journalism Competition and Preservation Act (proposed)", description: "Would grant news publishers a temporary safe harbor from antitrust law to collectively negotiate with dominant tech platforms for compensation. Would help fund journalism but does not address hedge fund ownership.", direction: "mixed", jurisdiction: "United States", year: 2023, era: "ongoing", status: "stalled" },
    { name: "Telecommunications Act of 1996", description: "Deregulated media ownership limits, enabling the consolidation wave that reduced thousands of independent media owners to a handful of conglomerates and made newspaper chains attractive acquisition targets for financial buyers.", direction: "negative", jurisdiction: "United States", year: 1996, era: "historical", status: "passed" },
    { name: "Australia News Media Bargaining Code", description: "Forces Google and Meta to pay for news content shared on their platforms. Generated hundreds of millions in payments to Australian news organizations.", direction: "positive", jurisdiction: "Australia", year: 2021, era: "ongoing", status: "passed" },
    { name: "Canada Online News Act (Bill C-18)", description: "Similar to Australia's model, requires digital platforms to compensate news publishers. Google agreed to pay $100M/year; Meta chose to block news content entirely.", direction: "positive", jurisdiction: "Canada", year: 2023, era: "ongoing", status: "passed" },
  ];

  for (const l of journLegislation) {
    sqlite.prepare(
      `INSERT INTO legislation (issue_id, name, description, direction, jurisdiction, year, era, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(journId, l.name, l.description, l.direction, l.jurisdiction, l.year, l.era, l.status, NOW);
  }

  // Geographies
  const journGeos = [
    { scope: "national", region: "North America", country: "United States", notes: "The epicenter of hedge-fund-driven newspaper destruction; 2,500+ closures since 2005, 1,800+ news deserts" },
    { scope: "national", region: "North America", country: "Canada", notes: "Similar consolidation pattern, partially addressed by Bill C-18 platform payments" },
    { scope: "national", region: "Europe", country: "United Kingdom", notes: "Local newspaper decline significant but partially offset by BBC local coverage; hedge fund ownership less prevalent" },
  ];

  for (const g of journGeos) {
    sqlite.prepare(
      `INSERT INTO issue_geographies (issue_id, scope, region, country, notes) VALUES (?, ?, ?, ?, ?)`
    ).run(journId, g.scope, g.region, g.country, g.notes);
  }

  // Status history
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(journId, "status", null, "emerging", "Digital disruption beginning to erode newspaper economics", "2008-01-01T00:00:00.000Z");
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(journId, "status", "emerging", "present", "Alden Global Capital and other hedge funds began systematic acquisition of newspaper chains; closure rate accelerated", "2015-06-01T00:00:00.000Z");
  sqlite.prepare(`INSERT INTO issue_status_history (issue_id, field, old_value, new_value, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(journId, "urgency", null, "9.0", "Upgraded: every month of delay means more newsrooms closed permanently and institutional knowledge lost that cannot be rebuilt", "2024-01-01T00:00:00.000Z");

  // Actors
  const aldenId = getOrCreateActor({ name: "Alden Global Capital", type: "corporation", description: "Hedge fund that is the largest newspaper owner in the US through its MediaNews Group and Tribune Publishing acquisitions. Notorious for gutting newsrooms to extract cash flows.", country: "US", sector: "finance" });
  const gannetId = getOrCreateActor({ name: "Gannett / New Media Investment Group", type: "corporation", description: "Largest US newspaper chain by circulation after merger with New Media Investment Group (Fortress Investment Group). Continues to cut newsroom staff while taking on merger debt.", country: "US", sector: "media" });
  const googleNewsId = getOrCreateActor({ name: "Google", type: "corporation", description: "Dominant digital advertising platform. Google and Meta together capture the majority of digital advertising revenue that once funded local journalism.", country: "US", sector: "tech" });
  const medillId = getOrCreateActor({ name: "Medill Local News Initiative (Northwestern)", type: "nonprofit", description: "Research center that produces the definitive annual report on local news closures and news deserts. Their data drives policy advocacy.", country: "US", sector: "media" });
  const reportForAmericaId = getOrCreateActor({ name: "Report for America", type: "nonprofit", description: "Places and supports journalists in local newsrooms across the US, partially subsidizing their salaries. A direct intervention to slow the loss of local reporting capacity.", country: "US", sector: "media" });

  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(aldenId, journId, "perpetuator", 0.95, "Largest single destroyer of local journalism in the US. Acquires newspapers, cuts staff to the bone, extracts remaining revenue, sells real estate. Not a turnaround — a managed liquidation for profit.", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(gannetId, journId, "perpetuator", 0.7, "Largest US newspaper chain by circulation; merger with New Media loaded debt that forced continued newsroom cuts. Institutional structure that prioritizes debt service over journalism.", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(googleNewsId, journId, "enabler", 0.8, "Captured the digital advertising revenue that once funded local journalism. Does not directly destroy newspapers but is the structural cause of the revenue collapse that makes them vulnerable to financial buyers.", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(medillId, journId, "researcher", 0.5, "Produces the definitive data on news deserts and closures that makes the scale of the crisis visible and politically actionable.", "seed", NOW);
  sqlite.prepare(`INSERT INTO actor_issue_links (actor_id, issue_id, role, influence, mechanism, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(reportForAmericaId, journId, "reformer", 0.4, "Places journalists in underserved local newsrooms with salary subsidies. A direct but limited intervention — addresses symptoms while the structural cause (financial ownership model) remains.", "seed", NOW);

  // Reform in other systems
  const journReforms = [
    { name: "Australia News Media Bargaining Code", description: "Forces Google and Meta to negotiate compensation with news publishers for linking to their content. Generated hundreds of millions in payments.", country: "Australia", outcome: "Significant new revenue stream for Australian news organizations. But Meta briefly pulled all news from the platform to pressure the government, demonstrating platform power.", year: 2021 },
    { name: "BBC local news ecosystem", description: "The BBC's local news coverage provides a public-service floor that prevents complete news deserts even as commercial local media declines.", country: "United Kingdom", outcome: "UK has fewer news deserts than the US despite similar commercial pressures, because public broadcasting fills gaps that the market abandons.", year: 1922 },
    { name: "Nordic public media funding models", description: "Scandinavian countries fund local journalism through a combination of public broadcasting, direct press subsidies, and favorable tax treatment.", country: "Norway / Sweden / Denmark", outcome: "Per-capita newspaper readership and local news coverage remain among the highest in the world. The funding model treats local journalism as public infrastructure, not a market commodity.", year: 1969 },
  ];

  for (const r of journReforms) {
    sqlite.prepare(
      `INSERT INTO reform_in_other_systems (issue_id, name, description, country, outcome, year, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(journId, r.name, r.description, r.country, r.outcome, r.year, NOW);
  }

  // ════════════════════════════════════════════════════════════
  // CROSS-ISSUE CAUSAL GRAPH
  // ════════════════════════════════════════════════════════════

  console.log("\n  Building causal graph...");

  // Helper to safely get issue IDs
  function issueId(name: string): number | null {
    const row = sqlite.prepare(`SELECT id FROM issues WHERE name = ?`).get(name) as { id: number } | undefined;
    return row?.id ?? null;
  }

  function addRelationship(
    sourceName: string,
    targetName: string,
    type: string,
    strength: number,
    direction: string,
    evidence: string
  ) {
    const sourceId = issueId(sourceName);
    const targetId = issueId(targetName);
    if (!sourceId || !targetId) {
      console.log(`    SKIP: "${sourceName}" -> "${targetName}" (issue not found)`);
      return;
    }
    sqlite.prepare(
      `INSERT INTO issue_relationships (source_issue_id, target_issue_id, relationship_type, strength, direction, evidence, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(sourceId, targetId, type, strength, direction, evidence, "seed", NOW);
    console.log(`    ${sourceName} --[${type}]--> ${targetName}`);
  }

  // ── From: Algorithmic bias laundering ──
  addRelationship(
    "Algorithmic bias laundering",
    "Racial and socioeconomic health disparities",
    "amplifies", 0.9, "one_way",
    "Biased healthcare algorithms (Optum, kidney function eGFR) directly deepen racial health disparities by under-allocating care to Black patients"
  );
  addRelationship(
    "Algorithmic bias laundering",
    "Automated surveillance and social control",
    "amplifies", 0.8, "one_way",
    "Facial recognition and predictive policing algorithms encode racial bias into surveillance infrastructure, disproportionately targeting communities of color"
  );
  addRelationship(
    "Concentration of power in fewer hands",
    "Algorithmic bias laundering",
    "enables", 0.7, "one_way",
    "When AI development is concentrated in a few corporations, bias in their systems becomes structural — there are no competitive alternatives trained on different data"
  );
  addRelationship(
    "Algorithmic bias laundering",
    "Hospital consolidation and local monopoly pricing",
    "amplifies", 0.5, "one_way",
    "Consolidated hospital systems deploy uniform algorithms across all facilities; biased algorithms in a monopoly system have no competitive check — patients cannot switch to a system with better algorithms"
  );

  // ── From: Hospital consolidation ──
  addRelationship(
    "Hospital consolidation and local monopoly pricing",
    "Rural healthcare collapse",
    "amplifies", 0.85, "one_way",
    "When large systems acquire rural hospitals, they close unprofitable service lines and redirect complex cases to urban facilities, accelerating the loss of rural healthcare access"
  );
  addRelationship(
    "Hospital consolidation and local monopoly pricing",
    "Medical debt as the leading cause of personal bankruptcy",
    "amplifies", 0.8, "one_way",
    "Monopoly pricing power means patients pay 6-18% more for the same care; in consolidated markets, patients cannot comparison shop or negotiate"
  );
  addRelationship(
    "Destruction of healthcare through PE acquisition",
    "Hospital consolidation and local monopoly pricing",
    "causes", 0.9, "one_way",
    "PE-driven hospital acquisitions are a primary mechanism of consolidation; the leveraged buyout model drives the financial pressure to acquire, consolidate, and extract"
  );
  addRelationship(
    "Private equity roll-ups creating stealth monopolies",
    "Hospital consolidation and local monopoly pricing",
    "enables", 0.8, "one_way",
    "The PE roll-up strategy — acquiring hospitals below antitrust review thresholds — is how consolidation happens without regulatory intervention"
  );

  // ── From: Destruction of local journalism ──
  addRelationship(
    "Destruction of local journalism via hedge fund acquisition",
    "Local news collapse and the creation of news deserts",
    "causes", 0.95, "one_way",
    "Hedge fund acquisition is the single largest direct cause of local newspaper closures — Alden Global Capital alone has gutted dozens of newsrooms"
  );
  addRelationship(
    "Destruction of local journalism via hedge fund acquisition",
    "Collapse of shared information commons",
    "amplifies", 0.7, "one_way",
    "As local papers disappear, communities lose their shared factual baseline and default to national partisan media, deepening epistemic fragmentation"
  );
  addRelationship(
    "Leveraged buyout debt loading and productive asset stripping",
    "Destruction of local journalism via hedge fund acquisition",
    "enables", 0.9, "one_way",
    "The hedge fund newspaper playbook IS the leveraged buyout playbook: acquire using debt, extract cash flows, sell assets (real estate), let the underlying enterprise die"
  );
  addRelationship(
    "Destruction of local journalism via hedge fund acquisition",
    "Hospital consolidation and local monopoly pricing",
    "enables", 0.6, "one_way",
    "Without local reporters covering hospital mergers, community health impacts, and pricing practices, consolidation proceeds without public scrutiny or political resistance"
  );

  // ── Cross-category connections ──
  addRelationship(
    "Industrialized misinformation",
    "Collapse of shared information commons",
    "amplifies", 0.8, "mutual",
    "AI-generated misinformation floods the information space while the collapse of shared information commons means there is no authoritative counterweight — each amplifies the other"
  );
  addRelationship(
    "Deepfakes and synthetic identity fraud",
    "Industrialized misinformation",
    "enables", 0.85, "one_way",
    "Deepfake technology provides the production tools for industrialized misinformation — synthetic video and audio that is increasingly indistinguishable from reality"
  );
  addRelationship(
    "Epistemic pollution at scale",
    "Student deskilling and educational hollowing",
    "amplifies", 0.6, "one_way",
    "When the information environment is polluted with AI-generated plausible-but-unverified content, students cannot learn to distinguish good from bad sources because the signals are degraded"
  );

  console.log("\n  Demo seed complete!");
  console.log(`  - 3 issues fully fleshed out with rankings, evidence, legislation, geographies, actors, status history`);
  const count = (table: string) => (sqlite.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number }).c;
  console.log(`  - ${count("issue_relationships")} causal relationships in the graph`);
  console.log(`  - ${count("evidence")} evidence citations`);
  console.log(`  - ${count("actors")} actors`);
  console.log(`  - ${count("actor_issue_links")} actor-issue links`);
  console.log(`  - ${count("legislation")} unified legislation entries`);
  console.log(`  - ${count("issue_geographies")} geographic scopes`);
  console.log(`  - ${count("issue_status_history")} status history entries`);
}

seedDemo();
