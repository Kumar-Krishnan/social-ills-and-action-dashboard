import { db } from "@/lib/db";

export function searchAll(query: string, limit = 10) {
  const pattern = `%${query}%`;

  const issueResults = db.$client
    .prepare(
      `SELECT id, name, slug, 'issue' as type, description
       FROM issues
       WHERE name LIKE ? OR description LIKE ?
       LIMIT ?`
    )
    .all(pattern, pattern, limit) as Array<{
    id: number;
    name: string;
    slug: string;
    type: string;
    description: string;
  }>;

  const categoryResults = db.$client
    .prepare(
      `SELECT id, name, slug, 'category' as type, description
       FROM categories
       WHERE name LIKE ? OR description LIKE ?
       LIMIT ?`
    )
    .all(pattern, pattern, limit) as Array<{
    id: number;
    name: string;
    slug: string;
    type: string;
    description: string;
  }>;

  return [...categoryResults, ...issueResults];
}
