"use client";

import { motion } from "framer-motion";
import { CalendarCheck, TrendingUp, Repeat, MapPin, type LucideIcon } from "lucide-react";

export interface StatisticProps {
  id: string;
  title: string;
  value: string | number;
  icon: string;
}

interface StatsCardProps {
  stat: StatisticProps;
  index: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarCheck,
  TrendingUp,
  Repeat,
  MapPin,
};

export function StatsCard({ stat, index }: StatsCardProps) {
  const Icon = ICON_MAP[stat.icon] || CalendarCheck;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{stat.title}</span>
        <Icon size={18} className="text-[#047260]" />
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
      </div>
    </motion.div>
  );
}
