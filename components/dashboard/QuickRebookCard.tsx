"use client";

import { Star, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export interface QuickRebookProps {
  id: string;
  serviceName: string;
  professionalName: string;
  professionalAvatar?: string;
  rating: number;
  jobsCompleted: number | string;
  lastBooked: string;
  price: number;
  isServiceAvailable?: boolean;
}

interface QuickRebookCardProps {
  item: QuickRebookProps;
}

export function QuickRebookCard({ item }: QuickRebookCardProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <motion.div
      whileHover={{ y: item.isServiceAvailable === false ? 0 : -4 }}
      className={`flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow ${item.isServiceAvailable === false ? 'opacity-75' : 'hover:shadow-md'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500">
          Last booked {item.lastBooked}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          Completed
        </span>
      </div>

      <h3 className="mb-4 text-lg font-bold text-slate-900">{item.serviceName}</h3>

      <div className="flex items-center gap-3 mb-6">
        {item.professionalAvatar && item.professionalAvatar !== "" ? (
          <img
            src={item.professionalAvatar}
            alt=""
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
            {getInitials(item.professionalName)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{item.professionalName}</span>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <Star size={12} className="fill-slate-700 text-slate-700" />
            <span className="font-medium text-slate-700">{item.rating}</span>
            <span>·</span>
            <span>{item.jobsCompleted} jobs</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-slate-900">{formatCurrency(item.price)}</span>
          {item.isServiceAvailable === false ? (
            <button 
              disabled
              className="flex items-center gap-2 rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
            >
              <Repeat size={16} />
              Rebook
            </button>
          ) : (
            <Link 
              href={`/rebook/${item.id}`}
              className="flex items-center gap-2 rounded-lg bg-[#047260] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              <Repeat size={16} />
              Rebook
            </Link>
          )}
        </div>
        {item.isServiceAvailable === false && (
          <span className="text-xs text-red-500 text-right">This service is currently unavailable.</span>
        )}
      </div>
    </motion.div>
  );
}
