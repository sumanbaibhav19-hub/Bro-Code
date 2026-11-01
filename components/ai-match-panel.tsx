"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SeniorCard } from "@/components/senior-card";
import { matchSeniors } from "@/lib/api";
import type { MatchMode, MatchResult, Senior } from "@/lib/types";

type AiMatchPanelProps = {
  seniors: Senior[];
  onConnect: (senior: Senior) => void;
};

type MatchState = {
  results: { senior: Senior; reason: string }[];
  mode: MatchMode;
};

const EXAMPLES = [
  "I want to break into product management after graduating",
  "Help me prepare for finance interviews",
  "I need feedback on my design portfolio",
];

export function AiMatchPanel({ seniors, onConnect }: AiMatchPanelProps) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchState | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = goal.trim();
    if (trimmed.length < 3) {
      setError("Tell us a little more about what you're looking for.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await matchSeniors(trimmed);
      const results = response.matches.flatMap((m: MatchResult) => {
        const senior = seniors.find((s) => s.id === m.id);
        return senior ? [{ senior, reason: m.reason }] : [];
      });
      setMatch({ results, mode: response.mode });
    } catch (err) {
      setMatch(null);
      setError(err instanceof Error ? err.message : "Matching is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-white to-teal-50/60 p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-teal-700">
        <Sparkles className="h-4 w-4" aria-hidden />
        AI matchmaking
      </div>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl">
        Describe your goal, we will find your people
      </h2>
      <p className="mt-2 max-w-2xl text-stone-600">
        Share what you are working towards and we will suggest the seniors best placed to help.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Textarea
          value={goal}
          maxLength={1000}
          rows={3}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. I'm a second-year mechanical engineering student and want an internship in electric vehicles."
          className="resize-none bg-white text-stone-900 placeholder:text-stone-400"
          aria-label="Your goal"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setGoal(example)}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-800"
            >
              {example}
            </button>
          ))}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-700 text-white transition-colors hover:bg-teal-800"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {loading ? "Finding matches..." : "Find my matches"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {match && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="mb-4 text-sm text-stone-600">
            {match.results.length === 0
              ? "No strong matches yet. Try describing your goal in a different way."
              : match.mode === "ai"
                ? "Your best matches, ranked by how well they fit your goal."
                : "Seniors who share interests with your goal."}
          </p>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {match.results.map(({ senior, reason }) => (
              <SeniorCard key={senior.id} senior={senior} reason={reason} onConnect={onConnect} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
