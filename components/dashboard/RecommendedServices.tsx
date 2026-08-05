"use client";

import { Star } from "lucide-react";
import Link from "next/link";

export interface RecommendedServiceProps {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
}

export function RecommendedServices({ services }: { services: RecommendedServiceProps[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
          <p className="mt-1 text-sm text-slate-500">Popular services you might like.</p>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="flex min-w-[260px] max-w-[280px] snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="h-32 w-full bg-slate-100 flex items-center justify-center">
              {/* Fallback image style since actual images aren't present */}
              {service.image ? (
                <img src={service.image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              ) : (
                <div className="text-slate-400 font-medium">Image</div>
              )}
            </div>
            <div className="flex flex-col p-4 flex-1 justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{service.name}</h3>
                  <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-slate-700">{service.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{service.category}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold text-slate-900">${service.price}</span>
                <Link 
                  href={`/dashboard`} 
                  className="rounded-lg bg-[#047260] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  Book
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
