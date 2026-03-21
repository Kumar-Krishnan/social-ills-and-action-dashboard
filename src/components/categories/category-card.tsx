import Link from "next/link";
import { Brain, Atom, Smartphone, HeartPulse, TrendingDown, Globe, Newspaper, Ship } from "lucide-react";
import type { CategoryWithCount } from "@/lib/types";

const ICONS: Record<string, React.ReactNode> = {
  "artificial-intelligence": <Brain className="h-5 w-5" />,
  "quantum-computing": <Atom className="h-5 w-5" />,
  "smartphones-social-media": <Smartphone className="h-5 w-5" />,
  "healthcare-system": <HeartPulse className="h-5 w-5" />,
  "private-equity-financialization": <TrendingDown className="h-5 w-5" />,
  "immigration": <Globe className="h-5 w-5" />,
  "media-ecosystem-decay": <Newspaper className="h-5 w-5" />,
  "offshoring": <Ship className="h-5 w-5" />,
};

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block rounded-lg border border-border/60 p-5 transition-all hover:border-primary/30 hover:bg-accent/40"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-muted-foreground group-hover:text-primary transition-colors">
          {ICONS[category.slug] || null}
        </span>
        <h3 className="font-semibold text-sm">{category.name}</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        {category.issueCount} issues
      </p>
    </Link>
  );
}
