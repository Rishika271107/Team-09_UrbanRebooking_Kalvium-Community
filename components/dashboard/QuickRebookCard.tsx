"use client";

import { Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export interface QuickRebookProps {
  id: string;
  serviceName: string;
  professionalName: string;
  professionalAvatar: string;
  rating: number;
  jobsCompleted: number;
  lastBooked: string;
  price: number;
}

interface QuickRebookCardProps {
  item: QuickRebookProps;
}

export function QuickRebookCard({ item }: QuickRebookCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-teal-50 px-2.5 py-1 text-sm font-semibold text-teal-700">
            {item.serviceName}
          </span>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Completed
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={item.professionalAvatar}
            alt={item.professionalName}
            className="h-16 w-16 rounded-full border-2 border-slate-100 object-cover"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900">{item.professionalName}</span>
            <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-700">{item.rating}</span>
              </div>
              <span>•</span>
              <span>{item.jobsCompleted} jobs</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-slate-500">
          Last booked: <span className="font-medium text-slate-700">{item.lastBooked}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t bg-slate-50 p-5">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Price</span>
          <span className="text-lg font-bold text-slate-900">${item.price}</span>
        </div>
        <Link 
          href={`/rebook/${item.id}`}
          className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          Rebook
        </Link>
      </div>
    </motion.div>
  );
}
