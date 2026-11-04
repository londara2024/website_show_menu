"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListFilter as Filter, LoaderCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_LABELS, parseCategory, type CategoryFilter } from "@/lib/menu-data";

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "ភេសជ្ជៈទាំងអស់" },
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
];

/**
 * Search box + category select. Only writes the filters to the URL —
 * the server-rendered <MenuList> reads them and renders the cards.
 */
export function MenuFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const category = parseCategory(searchParams.get("category") ?? undefined);
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [lastPushed, setLastPushed] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  // The URL changed from outside this input (e.g. the "reset" link): sync the box.
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    if (urlQuery !== lastPushed) {
      setQuery(urlQuery);
      setLastPushed(urlQuery);
    }
  }

  function navigate(next: { q?: string; category?: CategoryFilter }) {
    const params = new URLSearchParams(searchParams.toString());
    const q = (next.q ?? query).trim();
    const cat = next.category ?? category;
    if (q) params.set("q", q);
    else params.delete("q");
    if (cat !== "all") params.set("category", cat);
    else params.delete("category");
    setLastPushed(q);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounce typing so we don't hit the server on every keystroke.
  useEffect(() => {
    if (query.trim() === lastPushed) return;
    const id = setTimeout(() => navigate({ q: query }), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-card-hover md:flex-row md:items-center md:p-5">
      <div className="relative min-w-0 flex-1 md:max-w-md">
        {pending ? (
          <LoaderCircle className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 animate-spin text-roast" />
        ) : (
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-roast" />
        )}
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ស្វែងរកភេសជ្ជៈ…"
          aria-label="ស្វែងរកក្នុងម៉ឺនុយ"
          className="h-11 rounded-xl border-transparent bg-surface-container-low pl-11 text-[15px] placeholder:text-cocoa focus-visible:border-roast-container/40 focus-visible:ring-roast-container/20"
        />
      </div>

      <Select value={category} onValueChange={(v) => navigate({ category: v as CategoryFilter })}>
        <SelectTrigger
          aria-label="តម្រងតាមប្រភេទ"
          className="label-caps h-11! w-full gap-2 rounded-xl border-transparent bg-surface-container-low px-4 text-on-surface hover:bg-surface-container focus-visible:border-roast-container/40 focus-visible:ring-roast-container/20 md:w-56 dark:bg-surface-container-low dark:hover:bg-surface-container [&_svg]:text-roast"
        >
          <Filter className="size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="rounded-xl border-border bg-surface-container-lowest shadow-panel"
        >
          {FILTERS.map((f) => (
            <SelectItem
              key={f.value}
              value={f.value}
              className="label-caps rounded-lg py-2.5 text-on-surface-variant focus:bg-surface-container focus:text-on-surface data-[state=checked]:text-roast"
            >
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Static placeholder shown while the filters hydrate (same size, no layout shift). */
export function MenuFiltersFallback() {
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-card-hover md:flex-row md:items-center md:p-5">
      <div className="h-11 flex-1 rounded-xl bg-surface-container-low md:max-w-md" />
      <div className="h-11 w-full rounded-xl bg-surface-container-low md:w-56" />
    </div>
  );
}
