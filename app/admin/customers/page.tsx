"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, User, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/customers", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage your customers and view their history.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4 sm:p-6 bg-slate-50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#047260] focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <User className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No customers found</h3>
              <p className="mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Total Bookings</th>
                  <th className="px-6 py-4 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-slate-900">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200">
                        {customer._count?.bookings || 0} bookings
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 flex justify-end">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
