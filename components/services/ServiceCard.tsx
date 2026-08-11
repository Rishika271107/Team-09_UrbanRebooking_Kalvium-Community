import React from "react";
import { Star, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Service } from "@prisma/client";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  // Mocking rating and availability as per plan
  const mockRating = (4.0 + Math.random()).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 500) + 10;
  
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:border-teal-100 flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            {service.category}
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700">{mockRating}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-teal-700 transition-colors">
          {service.name}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 mt-auto">
          <Clock size={14} />
          <span>{service.durationMinutes} mins</span>
          <span className="text-slate-300">•</span>
          <span>{reviewCount} reviews</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="font-bold text-lg text-slate-900">
            ₹{service.price.toFixed(2)}
          </div>
          
          <Link href={`/book/${service.id}`} className="flex items-center justify-center gap-1 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-semibold text-sm hover:bg-teal-100 transition-colors">
            Book <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
