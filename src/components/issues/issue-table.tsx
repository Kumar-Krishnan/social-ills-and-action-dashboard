"use client";

import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { IssueCard } from "./issue-card";
import { ArrowUpDown } from "lucide-react";
import type { IssueWithRelations } from "@/lib/types";

function SortButton({ children, column }: { children: React.ReactNode; column: { toggleSorting: (desc: boolean) => void; getIsSorted: () => false | "asc" | "desc" } }) {
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {children}
      <ArrowUpDown className="h-3 w-3 opacity-50" />
    </button>
  );
}

const columns: ColumnDef<IssueWithRelations>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortButton column={column}>Issue</SortButton>,
    cell: ({ row }) => (
      <div className="py-1">
        <Link
          href={`/issues/${row.original.slug}`}
          className="font-medium text-[15px] hover:text-primary transition-colors"
        >
          {row.original.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={row.original.status} />
          <span className="text-xs text-muted-foreground">
            {row.original.categories.map((c) => c.name).join(", ")}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorFn: (row) => row.ranking?.severity ?? 0,
    id: "severity",
    header: ({ column }) => <SortButton column={column}>Severity</SortButton>,
    cell: ({ row }) => {
      const val = row.original.ranking?.severity;
      if (val == null) return <span className="text-xs text-muted-foreground/50 italic">--</span>;
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-14 bg-muted/60 rounded-full h-1">
            <div className="bg-red-500/80 rounded-full h-1" style={{ width: `${(val / 10) * 100}%` }} />
          </div>
          <span className="font-mono text-xs tabular-nums">{val.toFixed(1)}</span>
        </div>
      );
    },
    size: 130,
  },
  {
    accessorFn: (row) => row.ranking?.urgency ?? -1,
    id: "urgency",
    header: ({ column }) => <SortButton column={column}>Urgency</SortButton>,
    cell: ({ row }) => {
      const val = row.original.ranking?.urgency;
      if (val == null) return <span className="text-xs text-muted-foreground/50 italic">--</span>;
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-14 bg-muted/60 rounded-full h-1">
            <div className="bg-amber-500/80 rounded-full h-1" style={{ width: `${(val / 10) * 100}%` }} />
          </div>
          <span className="font-mono text-xs tabular-nums">{val.toFixed(1)}</span>
        </div>
      );
    },
    size: 130,
  },
  {
    accessorFn: (row) => row.ranking?.compositeScore ?? -1,
    id: "compositeScore",
    header: ({ column }) => <SortButton column={column}>Score</SortButton>,
    cell: ({ row }) => {
      const val = row.original.ranking?.compositeScore;
      if (val == null) return <span className="text-xs text-muted-foreground/50 italic">--</span>;
      return (
        <span className="font-mono text-sm tabular-nums font-semibold text-primary">
          {val.toFixed(1)}
        </span>
      );
    },
    size: 80,
  },
];

export function IssueTable({ issues }: { issues: IssueWithRelations[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: issues,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }} className="h-10">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border/30 hover:bg-accent/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-3 md:hidden">
        {issues.length > 0 ? (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        ) : (
          <p className="text-center text-muted-foreground py-8">No issues found.</p>
        )}
      </div>
    </>
  );
}
