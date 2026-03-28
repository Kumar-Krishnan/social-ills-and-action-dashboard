"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, ChevronDown, ChevronUp } from "lucide-react";
import {
  RELATIONSHIP_TYPE_LABELS, RELATIONSHIP_TYPE_COLORS,
  DIRECTNESS_LABELS, DIRECTNESS_DESCRIPTIONS, DIRECTNESS_COLORS,
} from "@/lib/constants";
import type { IssueRelationship } from "@/lib/types";

export function RelationshipRow({
  rel,
  direction,
}: {
  rel: IssueRelationship;
  direction: "upstream" | "downstream";
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2 flex-wrap">
        {direction === "upstream" ? (
          <>
            <Link
              href={`/issues/${rel.relatedIssue.slug}`}
              className="font-medium text-sm hover:text-primary transition-colors"
            >
              {rel.relatedIssue.name}
            </Link>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${RELATIONSHIP_TYPE_COLORS[rel.relationshipType]}`}
            >
              {RELATIONSHIP_TYPE_LABELS[rel.relationshipType]}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground italic">this issue</span>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground italic">this issue</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${RELATIONSHIP_TYPE_COLORS[rel.relationshipType]}`}
            >
              {RELATIONSHIP_TYPE_LABELS[rel.relationshipType]}
            </span>
            <Link
              href={`/issues/${rel.relatedIssue.slug}`}
              className="font-medium text-sm hover:text-primary transition-colors"
            >
              {rel.relatedIssue.name}
            </Link>
          </>
        )}

        {/* Directness badge — clickable to expand detail */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-xs px-1.5 py-0.5 rounded ml-auto cursor-pointer inline-flex items-center gap-1 transition-colors ${DIRECTNESS_COLORS[rel.directness]}`}
          title={DIRECTNESS_DESCRIPTIONS[rel.directness]}
        >
          {DIRECTNESS_LABELS[rel.directness]}
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="mt-2 ml-1 p-3 rounded-md bg-muted/40 text-xs space-y-2">
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">
              {DIRECTNESS_LABELS[rel.directness]}:
            </span>{" "}
            {DIRECTNESS_DESCRIPTIONS[rel.directness]}
          </p>
          {rel.evidence && (
            <p className="text-muted-foreground leading-relaxed">{rel.evidence}</p>
          )}
          {rel.relatedEvidenceCount > 0 && (
            <p className="text-muted-foreground inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <Link
                href={`/issues/${rel.relatedIssue.slug}`}
                className="hover:text-primary transition-colors underline underline-offset-2"
              >
                {rel.relatedEvidenceCount} source{rel.relatedEvidenceCount !== 1 ? "s" : ""} documented
              </Link>{" "}
              on the linked issue
            </p>
          )}
        </div>
      )}

      {/* Evidence text shown inline when NOT expanded */}
      {!expanded && rel.evidence && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed pl-1">
          {rel.evidence}
        </p>
      )}
    </div>
  );
}
