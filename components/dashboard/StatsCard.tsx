"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Clock, Settings, MapPin, type LucideIcon } from "lucide-react";

export interface StatisticProps {
  id: string;
  title: string;
  value: string | number;
  description: string;
  icon: string;
}

interface StatsCardProps {
  stat: StatisticProps;
  index: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarCheck,
  Clock,
  Settings,
  MapPin,
};

export function StatsCard({ stat, index }: StatsCardProps) {
  const Icon = ICON_MAP[stat.icon] || CalendarCheck;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-500">{stat.title}</span>
          <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-600">{stat.description}</div>
    </motion.div>
  );
}
