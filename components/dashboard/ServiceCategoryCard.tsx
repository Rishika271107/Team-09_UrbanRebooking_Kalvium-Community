"use client";

import { motion } from "framer-motion";
import { Home, Scissors, Wind, Zap, Droplets, Paintbrush, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

export interface CategoryProps {
  id: string;
  name: string;
  startingPrice: number;
  icon: string;
  color: string;
}

interface ServiceCategoryCardProps {
  category: CategoryProps;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Scissors,
  Wind,
  Zap,
  Droplets,
  Paintbrush,
  ShieldCheck,
  Sparkles,
};

export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  const Icon = ICON_MAP[category.icon] || Home;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border bg-white p-6 text-center shadow-sm transition-all hover:border-teal-100 hover:shadow-md"
    >
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${category.color || 'bg-slate-100 text-slate-600'}`}>
        <Icon size={28} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-slate-900">{category.name}</span>
        <span className="text-xs text-slate-500">From ${category.startingPrice}</span>
      </div>
    </motion.div>
  );
}
