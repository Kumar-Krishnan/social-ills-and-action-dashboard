import { RANKING_DIMENSIONS } from "@/lib/constants";

interface RankingDisplayProps {
  ranking: {
    severity: number | null;
    urgency: number | null;
    tractability: number | null;
    populationAffected: number | null;
    reversibility: number | null;
    visibility: number | null;
    institutionalCapture: number | null;
    compositeScore: number | null;
  };
  compact?: boolean;
}

const BAR_COLORS: Record<string, string> = {
  severity: "bg-red-500/80",
  urgency: "bg-amber-500/80",
  tractability: "bg-emerald-500/80",
  populationAffected: "bg-blue-500/80",
  reversibility: "bg-cyan-500/80",
  visibility: "bg-yellow-500/80",
  institutionalCapture: "bg-rose-500/80",
  compositeScore: "bg-primary",
};

export function RankingDisplay({ ranking, compact = false }: RankingDisplayProps) {
  const dimensions = compact
    ? RANKING_DIMENSIONS.filter((d) => d.key === "compositeScore" || d.key === "severity")
    : RANKING_DIMENSIONS;

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {dimensions.map((dim) => {
        const value = ranking[dim.key as keyof typeof ranking];
        const scored = value != null;
        const percentage = scored ? (value / 10) * 100 : 0;
        const color = BAR_COLORS[dim.key] || "bg-primary";

        return (
          <div key={dim.key}>
            <div className="flex justify-between items-baseline mb-1">
              <span className={compact ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>
                {dim.label}
              </span>
              {scored ? (
                <span className={`font-mono tabular-nums ${compact ? "text-xs" : "text-sm font-medium"}`}>
                  {value.toFixed(1)}
                </span>
              ) : (
                <span className={`italic ${compact ? "text-xs" : "text-xs"} text-muted-foreground/60`}>
                  Not yet scored
                </span>
              )}
            </div>
            <div className={`w-full bg-muted/60 rounded-full ${compact ? "h-1" : "h-1.5"}`}>
              {scored ? (
                <div
                  className={`${color} rounded-full ${compact ? "h-1" : "h-1.5"} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              ) : (
                <div
                  className={`bg-muted-foreground/10 rounded-full ${compact ? "h-1" : "h-1.5"}`}
                  style={{ width: "100%" }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
