"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, Search, UserCheck, UserX, Star, Filter } from "lucide-react";

export default function AdminProfessionalsClient() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");

  const fetchProfessionals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterActive !== "all") params.append("active", filterActive);
      
      const res = await fetch(`/api/admin/professionals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProfessionals(data.professionals);
      }
    } catch (error) {
      console.error("Failed to fetch professionals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const t = setTimeout(() => fetchProfessionals(), 300);
    return () => clearTimeout(t);
  }, [search, filterActive]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Professionals</h1>
          <p className="text-sm text-slate-500">Manage all registered service providers.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260] bg-white"
          >
            <option value="all">All Professionals</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
        </div>
      ) : professionals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No professionals found</h3>
          <p className="mt-1 text-slate-500">No service providers match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <div key={pro.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-teal-300">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-lg">
                    {pro.user.name.charAt(0)}
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    pro.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {pro.active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                    {pro.active ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900">{pro.user.name}</h3>
                <p className="text-sm text-slate-500 mb-1">{pro.user.email}</p>
                {pro.user.phone && <p className="text-sm text-slate-500">{pro.user.phone}</p>}
                
                <div className="mt-4 flex flex-col gap-2 bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Rating</span>
                    <div className="flex items-center gap-1 font-semibold text-slate-900">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {pro.rating ? pro.rating.toFixed(1) : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Joined</span>
                    <span className="font-medium text-slate-900">
                      {new Date(pro.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
