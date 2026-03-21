import { STATUS_LABELS, PHASE_LABELS } from "@/lib/constants";

const STATUS_DOT: Record<string, string> = {
  present: "bg-red-500",
  emerging: "bg-amber-500",
  approaching: "bg-orange-400",
  future: "bg-blue-400",
  possible: "bg-slate-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || "bg-slate-400"}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PhaseBadge({ phase }: { phase: string }) {
  return (
    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
      {PHASE_LABELS[phase] || phase}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: string }) {
  return (
    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
      {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
    </span>
  );
}
