import React from "react";
import { formatCurrency } from "@/lib/format";
import { Clock, MapPin, Tag } from "lucide-react";

interface BookingSummaryProps {
  serviceName: string;
  price: number;
  originalBookingId: string;
}

export function BookingSummary({ serviceName, price, originalBookingId }: BookingSummaryProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">Rebooking</span>
          <span className="text-xs text-slate-400 font-mono">ID: {originalBookingId.slice(-6).toUpperCase()}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{serviceName}</h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1.5 font-medium">
          <Tag size={16} className="text-slate-400" />
          {formatCurrency(price)}
        </div>
        <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} className="text-slate-400" />
          <span>Previously ~45 mins</span>
        </div>
      </div>
    </div>
  );
}
