import { Suspense } from "react";
import { getAllIssues } from "@/lib/queries/issues";
import { getAllCategories } from "@/lib/queries/categories";
import { IssueTable } from "@/components/issues/issue-table";
import { IssueFilters } from "@/components/issues/issue-filters";

export const metadata = {
  title: "Browse Issues | Social Ills Tracker",
  description: "Browse and filter all tracked social ills.",
};

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const category = typeof params.category === "string" ? params.category : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : "composite_score";
  const sortOrder =
    typeof params.sortOrder === "string"
      ? (params.sortOrder as "asc" | "desc")
      : "desc";

  const issues = getAllIssues({ category, status, search, sortBy, sortOrder });
  const categories = getAllCategories();

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Issues</h1>
        <p className="text-muted-foreground">
          {issues.length} social ills across {categories.length} categories.
        </p>
      </div>

      <Suspense fallback={null}>
        <IssueFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Suspense>

      <div className="mt-8">
        <IssueTable issues={issues} />
      </div>
    </div>
  );
}
