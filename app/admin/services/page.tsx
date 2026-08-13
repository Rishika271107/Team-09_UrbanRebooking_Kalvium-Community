"use client";

import { useState, useEffect } from "react";
import { Loader2, Briefcase, Plus, Edit2, CheckCircle2, Clock } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services</h1>
          <p className="text-sm text-slate-500">Manage the services you offer.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#047260] px-4 py-2 text-sm font-semibold text-white hover:bg-[#035c4e]">
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No services found</h3>
          <p className="mt-1 text-slate-500">Add a service to start receiving bookings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-teal-300">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                    {service.category}
                  </span>
                  <button className="text-slate-400 hover:text-teal-600 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mt-2">{service.name}</h3>
                
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-slate-900">₹{service.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{service.durationMinutes} mins</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-end gap-2">
                <button className="text-xs font-semibold text-[#047260] hover:underline">Edit Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
