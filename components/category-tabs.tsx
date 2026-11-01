"use client";

type CategoryTabsProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export function CategoryTabs({ label, options, value, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={label}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-stone-400"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
