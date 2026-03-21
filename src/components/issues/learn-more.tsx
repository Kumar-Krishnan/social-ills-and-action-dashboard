"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LearnMore({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <h2 className="text-xl font-semibold">Deep Dive</h2>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground transition-transform duration-200",
          expanded && "rotate-180"
        )} />
      </button>
      {expanded && (
        <article className="prose prose-sm dark:prose-invert max-w-none mt-2 prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-p:text-muted-foreground prose-p:leading-[1.75] prose-strong:text-foreground prose-li:text-muted-foreground prose-li:leading-[1.75] prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
