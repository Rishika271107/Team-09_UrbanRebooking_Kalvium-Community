import React from "react";
import { ServiceCard } from "./ServiceCard";
import type { Service } from "@prisma/client";

interface ServiceGridProps {
  services: Service[];
}

export function ServiceGrid({ services }: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 mt-4">
        <h3 className="text-lg font-bold text-slate-900">No services found</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          We couldn't find any services matching your filters. Try adjusting your search or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
