"use client";

import { Briefcase, CalendarClock, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Senior } from "@/lib/types";

type SeniorCardProps = {
  senior: Senior;
  reason?: string;
  onConnect: (senior: Senior) => void;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SeniorCard({ senior, reason, onConnect }: SeniorCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-lg font-semibold text-white shadow-inner">
          {initialsOf(senior.full_name)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold leading-tight text-stone-900">
            {senior.full_name}
          </h3>
          <p className="mt-1 text-sm leading-snug text-stone-600">{senior.headline}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-stone-600">
        {senior.company && (
          <p className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
            <span className="truncate">{senior.company}</span>
          </p>
        )}
        <p className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
          <span className="truncate">
            {senior.field}
            {senior.graduation_year ? ` · Class of ${senior.graduation_year}` : ""}
          </span>
        </p>
        {senior.availability && (
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
            <span className="truncate">{senior.availability}</span>
          </p>
        )}
      </div>

      {senior.skills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {senior.skills.slice(0, 4).map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
            >
              {skill}
            </li>
          ))}
        </ul>
      )}

      {reason && (
        <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <p>{reason}</p>
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button
          onClick={() => onConnect(senior)}
          className="w-full bg-teal-700 text-white transition-colors hover:bg-teal-800"
        >
          Connect with {senior.full_name.split(" ")[0]}
        </Button>
      </div>
    </article>
  );
}
