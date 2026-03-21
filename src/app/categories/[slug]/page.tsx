import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { getAllIssues } from "@/lib/queries/issues";
import { getAllCategories } from "@/lib/queries/categories";
import { IssueTable } from "@/components/issues/issue-table";
import { IssueFilters } from "@/components/issues/issue-filters";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };
  return {
    title: `${category.name} | Social Ills Tracker`,
    description: category.description || `Social ills from ${category.name}`,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const status = typeof sp.status === "string" ? sp.status : undefined;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const sortBy = typeof sp.sortBy === "string" ? sp.sortBy : "composite_score";
  const sortOrder =
    typeof sp.sortOrder === "string" ? (sp.sortOrder as "asc" | "desc") : "desc";

  const issues = getAllIssues({
    category: slug,
    status,
    search,
    sortBy,
    sortOrder,
  });

  const categories = getAllCategories();

  return (
    <div className="container mx-auto px-6 py-10">
      <Link
        href="/categories"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        All categories
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">
          {category.issueCount} issues tracked
        </p>
      </div>

      {category.description && (
        <blockquote className="border-l-2 border-primary/40 pl-5 mb-10 max-w-2xl">
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            {category.description}
          </p>
        </blockquote>
      )}

      <Suspense fallback={null}>
        <IssueFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          currentCategory={slug}
        />
      </Suspense>

      <div className="mt-8">
        <IssueTable issues={issues} />
      </div>
    </div>
  );
}
