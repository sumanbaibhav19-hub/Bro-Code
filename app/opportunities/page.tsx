"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryTabs } from "@/components/category-tabs";
import { OpportunityCard, OPPORTUNITY_CATEGORY_LABELS } from "@/components/opportunity-card";
import { SiteHeader } from "@/components/site-header";
import { useAsyncList } from "@/hooks/use-async-list";
import { fetchOpportunities } from "@/lib/api";
import type { OpportunityCategory } from "@/lib/types";

const ALL = "all";

export default function OpportunitiesPage() {
  const { items, loading, error, reload } = useAsyncList(fetchOpportunities);
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  const categoryOptions = [
    { value: ALL, label: "All" },
    ...(Object.keys(OPPORTUNITY_CATEGORY_LABELS) as OpportunityCategory[]).map((value) => ({
      value,
      label: `${OPPORTUNITY_CATEGORY_LABELS[value]}s`,
    })),
  ];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((o) => {
      if (category !== ALL && o.category !== category) return false;
      if (!needle) return true;
      return [o.title, o.organization, o.location, o.description]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [items, category, query]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Local opportunity hub</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            Internships, workshops and events close to you
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Hand-picked openings from local employers, campus teams and competition organisers.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CategoryTabs
              label="Filter by type"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />
            <div className="relative w-full lg:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search opportunities"
                className="h-11 bg-white pl-9"
                aria-label="Search opportunities"
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-20 text-stone-600">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Loading opportunities...
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-red-800">{error}</p>
              <Button variant="outline" onClick={reload} className="gap-2">
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
              No opportunities match your filters right now. Check back soon.
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
