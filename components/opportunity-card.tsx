import { ArrowUpRight, CalendarDays, MapPin, Monitor } from "lucide-react";
import type { Opportunity, OpportunityCategory } from "@/lib/types";

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  internship: "Internship",
  workshop: "Workshop",
  event: "Event",
  competition: "Competition",
};

const CATEGORY_STYLES: Record<OpportunityCategory, string> = {
  internship: "bg-teal-50 text-teal-800",
  workshop: "bg-amber-50 text-amber-900",
  event: "bg-sky-50 text-sky-900",
  competition: "bg-rose-50 text-rose-800",
};

function formatDeadline(deadline: string) {
  return new Date(`${deadline}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[opportunity.category]}`}
        >
          {OPPORTUNITY_CATEGORY_LABELS[opportunity.category]}
        </span>
        {opportunity.deadline && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Apply by {formatDeadline(opportunity.deadline)}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-stone-900">{opportunity.title}</h3>
      <p className="mt-1 text-sm font-medium text-stone-600">{opportunity.organization}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{opportunity.description}</p>

      <div className="mt-5 flex items-center gap-2 text-sm text-stone-600">
        {opportunity.is_remote ? (
          <Monitor className="h-4 w-4 text-teal-700" aria-hidden />
        ) : (
          <MapPin className="h-4 w-4 text-teal-700" aria-hidden />
        )}
        <span>{opportunity.location}</span>
      </div>

      {opportunity.apply_url && (
        <a
          href={opportunity.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
        >
          View details
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      )}
    </article>
  );
}
