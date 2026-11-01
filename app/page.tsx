"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiMatchPanel } from "@/components/ai-match-panel";
import { SiteHeader } from "@/components/site-header";
import { CategoryTabs } from "@/components/category-tabs";
import { ConnectDialog } from "@/components/connect-dialog";
import { SeniorCard } from "@/components/senior-card";
import { fetchSeniors } from "@/lib/api";
import type { Senior } from "@/lib/types";

const ALL_FIELDS = "All";

export default function Home() {
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [field, setField] = useState(ALL_FIELDS);
  const [selectedSenior, setSelectedSenior] = useState<Senior | null>(null);

  const loadSeniors = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setSeniors(await fetchSeniors());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeniors();
  }, []);

  const fields = useMemo(
    () => [ALL_FIELDS, ...Array.from(new Set(seniors.map((s) => s.field))).sort()],
    [seniors],
  );

  const visibleSeniors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return seniors.filter((s) => {
      if (field !== ALL_FIELDS && s.field !== field) return false;
      if (!needle) return true;
      return [s.full_name, s.headline, s.field, s.company ?? "", ...s.skills, ...s.mentorship_areas]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [seniors, query, field]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            Mentorship for students
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.15] tracking-tight text-stone-900 sm:text-5xl">
            Learn from people who walked your path
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Connect with seniors and graduates for career advice, interview practice, and
            honest guidance on the next step.
          </p>
        </section>

        <AiMatchPanel seniors={seniors} onConnect={setSelectedSenior} />

        <section id="directory" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Senior directory</h2>
              <p className="mt-1 text-stone-600">
                {loading
                  ? "Loading seniors..."
                  : `${visibleSeniors.length} ${visibleSeniors.length === 1 ? "senior" : "seniors"} available to connect`}
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, skill or company"
                className="h-11 bg-white pl-9"
                aria-label="Search seniors"
              />
            </div>
          </div>

          <CategoryTabs
            label="Filter by field"
            options={fields.map((f) => ({ value: f, label: f }))}
            value={field}
            onChange={setField}
          />

          {loading && (
            <div className="flex items-center justify-center gap-3 py-20 text-stone-600">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Loading the directory...
            </div>
          )}

          {!loading && loadError && (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-red-800">{loadError}</p>
              <Button variant="outline" onClick={loadSeniors} className="gap-2">
                <RefreshCw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            </div>
          )}

          {!loading && !loadError && visibleSeniors.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
              No seniors match your search. Try a different skill or clear the filters.
            </div>
          )}

          {!loading && !loadError && visibleSeniors.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleSeniors.map((senior) => (
                <SeniorCard key={senior.id} senior={senior} onConnect={setSelectedSenior} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-stone-500 sm:px-6 lg:px-8">
          SeniorConnect helps students find mentors. Be respectful and keep conversations professional.
        </div>
      </footer>

      <ConnectDialog senior={selectedSenior} onClose={() => setSelectedSenior(null)} />
    </div>
  );
}
