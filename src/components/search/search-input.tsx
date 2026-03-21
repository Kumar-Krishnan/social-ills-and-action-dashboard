"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, Brain, Atom, Smartphone, AlertTriangle } from "lucide-react";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "artificial-intelligence": <Brain className="h-4 w-4" />,
  "quantum-computing": <Atom className="h-4 w-4" />,
  "smartphones-social-media": <Smartphone className="h-4 w-4" />,
};

export function SearchInput() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // ignore
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (result.type === "category") {
      router.push(`/categories/${result.slug}`);
    } else {
      router.push(`/issues/${result.slug}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3 py-1.5 hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search issues and categories..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.filter((r) => r.type === "category").length > 0 && (
            <CommandGroup heading="Categories">
              {results
                .filter((r) => r.type === "category")
                .map((result) => (
                  <CommandItem
                    key={`cat-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {CATEGORY_ICONS[result.slug] || <Search className="h-4 w-4" />}
                    <span className="ml-2">{result.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
          {results.filter((r) => r.type === "issue").length > 0 && (
            <CommandGroup heading="Issues">
              {results
                .filter((r) => r.type === "issue")
                .map((result) => (
                  <CommandItem
                    key={`issue-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <div className="ml-2">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </div>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
