"use client";

export interface CategoryProps {
  id: string;
  name: string;
  startingPrice: number;
  icon: any;
  color: string;
}

interface ServiceCategoryCardProps {
  category: CategoryProps;
  onClick?: () => void;
}

export function ServiceCategoryCard({ category, onClick }: ServiceCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-teal-300 hover:shadow-md`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${category.color}`}>
        <span className="text-lg">🔧</span>
      </div>
      <span className="text-sm font-medium text-slate-700">{category.name}</span>
    </button>
  );
}