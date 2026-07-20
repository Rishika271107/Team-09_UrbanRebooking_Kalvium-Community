"use client";

import { ChevronRight } from "lucide-react";

export interface UpcomingServiceProps {
  id: string;
  serviceName: string;
  professionalName: string;
  professionalAvatar: string;
  date: string;
  time: string;
}

interface UpcomingServicesProps {
  services: UpcomingServiceProps[];
}

export function UpcomingServices({ services }: UpcomingServicesProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Upcoming Services</h2>
        <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View All</button>
      </div>

      <div className="flex flex-col gap-4">
        {services.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No upcoming services</div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={service.professionalAvatar}
                  alt={service.professionalName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{service.professionalName}</span>
                  <span className="text-sm text-slate-500">{service.serviceName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="font-semibold text-slate-900">{service.date}</span>
                  <span className="text-sm text-slate-500">{service.time}</span>
                </div>
                <ChevronRight className="text-slate-400" size={20} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
