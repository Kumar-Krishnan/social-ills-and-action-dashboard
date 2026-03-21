"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowUpDown } from "lucide-react";
import { STATUS_LABELS, SORT_OPTIONS } from "@/lib/constants";

interface IssueFiltersProps {
  categories: { slug: string; name: string }[];
  statuses?: string[];
  currentCategory?: string;
}

export function IssueFilters({ categories, statuses, currentCategory }: IssueFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      }
      return current.toString();
    },
    [searchParams]
  );

  const updateFilter = (params: Record<string, string | null>) => {
    const qs = createQueryString(params);
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const activeCategory = searchParams.get("category") || currentCategory || "";
  const activeStatus = searchParams.get("status") || "";
  const activeSort = searchParams.get("sortBy") || "composite_score";
  const activeSortOrder = searchParams.get("sortOrder") || "desc";
  const activeSearch = searchParams.get("search") || "";

  const allStatuses = statuses || Object.keys(STATUS_LABELS);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search issues..."
          defaultValue={activeSearch}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              updateFilter({ search: value });
            } else {
              updateFilter({ search: null });
            }
          }}
        />
      </div>

      {/* Category filters */}
      {!currentCategory && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!activeCategory ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter({ category: null })}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.slug}
              variant={activeCategory === cat.slug ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilter({
                  category: activeCategory === cat.slug ? null : cat.slug,
                })
              }
            >
              {cat.name}
            </Button>
          ))}
        </div>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!activeStatus ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter({ status: null })}
        >
          All Statuses
        </Button>
        {allStatuses.map((status) => (
          <Button
            key={status}
            variant={activeStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() =>
              updateFilter({
                status: activeStatus === status ? null : status,
              })
            }
          >
            {STATUS_LABELS[status] || status}
          </Button>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={activeSort === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (activeSort === opt.value) {
                updateFilter({
                  sortOrder: activeSortOrder === "desc" ? "asc" : "desc",
                });
              } else {
                updateFilter({ sortBy: opt.value, sortOrder: "desc" });
              }
            }}
          >
            {opt.label}
            {activeSort === opt.value && (
              <span className="ml-1">{activeSortOrder === "desc" ? "\u2193" : "\u2191"}</span>
            )}
          </Button>
        ))}
      </div>

      {/* Active filter badges */}
      {(activeCategory || activeStatus || activeSearch) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          {activeSearch && (
            <Badge variant="secondary" className="gap-1">
              Search: {activeSearch}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter({ search: null })}
              />
            </Badge>
          )}
          {activeCategory && !currentCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter({ category: null })}
              />
            </Badge>
          )}
          {activeStatus && (
            <Badge variant="secondary" className="gap-1">
              {STATUS_LABELS[activeStatus] || activeStatus}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter({ status: null })}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateFilter({
                search: null,
                category: null,
                status: null,
                sortBy: null,
                sortOrder: null,
              })
            }
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
