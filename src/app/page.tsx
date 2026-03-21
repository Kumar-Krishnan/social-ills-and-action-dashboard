import Link from "next/link";
import { getAllIssues } from "@/lib/queries/issues";
import { getAllCategories } from "@/lib/queries/categories";
import { CategoryCard } from "@/components/categories/category-card";
import { IssueCard } from "@/components/issues/issue-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const categories = getAllCategories();
  const topIssues = getAllIssues({ sortBy: "original_rank", sortOrder: "asc", limit: 6 });
  const allIssues = getAllIssues({});
  const totalIssues = allIssues.length;

  const statuses = allIssues.reduce(
    (acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div>
      {/* Hero — editorial, not marketing */}
      <section className="border-b border-border/50">
        <div className="container mx-auto px-6 py-20 md:py-28 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-6">
            A catalog of structural harms
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            {totalIssues} social ills from technology, finance, media, and policy
            &mdash; documented, ranked, and connected to the actors and
            legislation that shape them.
          </p>
          <div className="flex gap-3">
            <Link href="/issues">
              <Button size="lg" className="rounded-lg">
                Browse issues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="lg" className="rounded-lg">
                By category
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — understated, not boxed */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
          {[
            { value: totalIssues, label: "Issues tracked" },
            { value: categories.length, label: "Categories" },
            { value: statuses["present"] || 0, label: "Present now" },
            {
              value:
                (statuses["emerging"] || 0) +
                (statuses["approaching"] || 0) +
                (statuses["future"] || 0),
              label: "Emerging",
            },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-2">Categories</h2>
          <p className="text-muted-foreground mb-8">
            Eight domains where structural harms concentrate.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Featured issues</h2>
              <p className="text-muted-foreground">
                Top-ranked across categories. Scores pending community input.
              </p>
            </div>
            <Link href="/issues" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
          <div className="mt-6 sm:hidden">
            <Link href="/issues">
              <Button variant="outline" className="w-full">
                View all issues <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
