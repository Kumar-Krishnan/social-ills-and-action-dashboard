import { db } from "@/lib/db";
import type { CategoryWithCount } from "@/lib/types";

export function getAllCategories(): CategoryWithCount[] {
  const rows = db.$client
    .prepare(
      `SELECT c.id, c.name, c.slug, c.description,
        COUNT(ic.issue_id) as issueCount
      FROM categories c
      LEFT JOIN issue_categories ic ON ic.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name`
    )
    .all() as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) || null,
    issueCount: row.issueCount as number,
  }));
}

export function getCategoryBySlug(slug: string) {
  const row = db.$client
    .prepare(
      `SELECT c.id, c.name, c.slug, c.description,
        COUNT(ic.issue_id) as issueCount
      FROM categories c
      LEFT JOIN issue_categories ic ON ic.category_id = c.id
      WHERE c.slug = ?
      GROUP BY c.id`
    )
    .get(slug) as Record<string, unknown> | undefined;

  if (!row) return null;

  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) || null,
    issueCount: row.issueCount as number,
  };
}
