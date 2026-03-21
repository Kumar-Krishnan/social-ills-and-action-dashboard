import { NextRequest, NextResponse } from "next/server";
import { getAllIssues } from "@/lib/queries/issues";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const issues = getAllIssues({
    category: searchParams.get("category") || undefined,
    status: searchParams.get("status") || undefined,
    phase: searchParams.get("phase") || undefined,
    search: searchParams.get("search") || undefined,
    tag: searchParams.get("tag") || undefined,
    sortBy: searchParams.get("sortBy") || "composite_score",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100,
    offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
  });

  return NextResponse.json(issues);
}
