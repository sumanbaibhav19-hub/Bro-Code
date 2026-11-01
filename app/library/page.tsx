"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/category-tabs";
import { RESOURCE_CATEGORY_LABELS, ResourceCard } from "@/components/resource-card";
import { ResourceDialog } from "@/components/resource-dialog";
import { SiteHeader } from "@/components/site-header";
import { useAsyncList } from "@/hooks/use-async-list";
import { fetchExperienceResources } from "@/lib/api";
import type { ExperienceResource, ResourceCategory } from "@/lib/types";

const ALL = "all";

export default function LibraryPage() {
  const { items, loading, error, reload } = useAsyncList(fetchExperienceResources);
  const [category, setCategory] = useState<string>(ALL);
  const [openResource, setOpenResource] = useState<ExperienceResource | null>(null);

  const categoryOptions = [
    { value: ALL, label: "All" },
    ...(Object.keys(RESOURCE_CATEGORY_LABELS) as ResourceCategory[]).map((value) => ({
      value,
      label: RESOURCE_CATEGORY_LABELS[value],
    })),
  ];

  const visible = useMemo(
    () => items.filter((r) => category === ALL || r.category === category),
    [items, category],
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Senior experience library</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            Lessons from seniors who have been there
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Short reads on career decisions, interview preparation and study habits that actually work.
          </p>
        </section>

        <section className="space-y-6">
          <CategoryTabs
            label="Filter by topic"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />

          {loading && (
            <div className="flex items-center justify-center gap-3 py-20 text-stone-600">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Loading the library...
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
              No articles in this topic yet.
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onOpen={setOpenResource} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ResourceDialog resource={openResource} onClose={() => setOpenResource(null)} />
    </div>
  );
}
