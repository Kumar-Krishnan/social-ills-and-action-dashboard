# Data File Schema

Every category is a single JSON file in `data/`. One file = one category = N issues with all their child relations.

## File Structure

```jsonc
{
  "category": "Human-readable category name",
  "slug": "url-slug",                         // used for routing
  "structural_observation": "...",             // category-level editorial summary
  "issues": [
    {
      // ── Required on every issue ──
      "name": "Issue name",
      "description": "Substantive description with data points",
      "status": "present | emerging | approaching | future | possible",
      "phase": "already_present | arriving_or_structurally_inevitable | near_term_high_confidence | medium_term_structurally_likely | longer_term_structurally_important",
      "confidence": "high | medium | low",

      // ── Child relations (arrays, may be empty) ──
      "reformers": [
        {
          "name": "Person or organization name",          // required
          "description": "What they do and why it matters", // required
          "url": "https://..." | null                      // nullable
        }
      ],
      "legislation": [
        {
          "name": "Law or policy name",                    // required
          "description": "What it does and its impact",    // required
          "direction": "positive | negative | mixed",      // required — replaces the old two-table split
          "jurisdiction": "US (federal) | US (state) | EU | etc.", // required
          "status": "passed | stalled | in_debate | vetoed | expired | vacated | proposed", // default: "passed"
          "year": 2024 | null,                             // nullable
          "url": "https://..." | null                      // nullable
        }
      ],
      "structurally_incentivized": [
        {
          "name": "Entity or class of entities",           // required
          "description": "Who they are and their role",    // required
          "mechanism": "HOW they benefit from the status quo", // required
          "url": "https://..." | null                      // nullable
        }
      ],
      "reform_in_other_systems": [
        {
          "name": "Reform name or program",                // required
          "description": "What the reform does",           // required
          "country": "Country or region",                  // required
          "outcome": "Results and relevance to the US",    // required
          "year": 1948 | null,                             // nullable
          "url": "https://..." | null                      // nullable
        }
      ]
    }
  ]
}
```

## Key Decisions

1. **One file per category.** All issues and their child data in one place. No separate ingest files.
2. **Unified legislation.** `direction: "positive" | "negative" | "mixed"` replaces the old `positive_legislation` / `negative_legislation` table split.
3. **All fields required.** Every issue must have `status`, `phase`, and `confidence`. No more sparse data.
4. **Child arrays always present.** Even if empty `[]`. This makes validation and generation trivial.
5. **No `rank` or `originalRank`.** Issue ordering is implied by array position.
6. **No `era` on legislation.** Was never used meaningfully. `status` captures the lifecycle.
7. **No `category` field on individual items.** The category is the file.

## Scripts

- `npm run db:seed` — reads all data files, creates categories/issues/tags/rankings/child-relations in one pass.
- `npm run db:reset` — drops DB, re-migrates, re-seeds.

No separate ingest step. Seed is atomic and complete.
