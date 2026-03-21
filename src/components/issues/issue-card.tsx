import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { IssueWithRelations } from "@/lib/types";

export function IssueCard({ issue }: { issue: IssueWithRelations }) {
  const score = issue.ranking?.compositeScore;

  return (
    <Link
      href={`/issues/${issue.slug}`}
      className="group block rounded-lg border border-border/60 p-5 transition-all hover:border-primary/30 hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-[15px] leading-snug group-hover:text-primary transition-colors">
          {issue.name}
        </h3>
        {score != null ? (
          <span className="text-xs font-mono text-primary font-semibold tabular-nums shrink-0 mt-0.5">
            {score.toFixed(1)}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/50 italic shrink-0 mt-1">
            unscored
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
        {issue.description}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={issue.status} />
        {issue.categories.map((cat) => (
          <span key={cat.id} className="text-xs text-muted-foreground">
            {cat.name}
          </span>
        ))}
      </div>
    </Link>
  );
}
