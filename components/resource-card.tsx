import { Clock } from "lucide-react";
import type { ExperienceResource, ResourceCategory } from "@/lib/types";

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  career_guidance: "Career guidance",
  interview_tips: "Interview tips",
  study_resources: "Study resources",
};

type ResourceCardProps = {
  resource: ExperienceResource;
  onOpen: (resource: ExperienceResource) => void;
};

export function ResourceCard({ resource, onOpen }: ResourceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(resource)}
      className="group flex h-full w-full flex-col rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
          {RESOURCE_CATEGORY_LABELS[resource.category]}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {resource.read_minutes} min read
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-stone-900 group-hover:text-teal-800">
        {resource.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{resource.summary}</p>

      <div className="mt-5 border-t border-stone-100 pt-4">
        <p className="text-sm font-semibold text-stone-900">{resource.author_name}</p>
        <p className="text-xs text-stone-500">{resource.author_role}</p>
      </div>
    </button>
  );
}
