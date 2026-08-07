import React from "react";

interface FilterPanelProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export function FilterPanel({ categories, activeCategory, onCategoryChange }: FilterPanelProps) {
  return (
    <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0">
      <div className="flex items-center gap-2 py-2 px-4 sm:px-0 min-w-max sm:min-w-0 sm:flex-wrap">
        <button
          onClick={() => onCategoryChange("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === ""
              ? "bg-teal-700 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Services
        </button>
        
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-teal-700 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
