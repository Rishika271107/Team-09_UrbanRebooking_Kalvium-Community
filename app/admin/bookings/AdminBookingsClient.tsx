"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, Filter, Check, X, Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function AdminBookingsClient() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBookings = useCallback(async (silent = false, signal?: AbortSignal) => {
    if (!silent) setIsLoading(true);
    try {
      const url = new URL("/api/admin/bookings", window.location.origin);
      url.searchParams.set("page", page.toString());
      if (statusFilter) url.searchParams.set("status", statusFilter);
      if (searchQuery) url.searchParams.set("search", searchQuery);

      const res = await fetch(url.toString(), { signal });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      if (error?.name === "AbortError") return; // cancelled – ignore
      console.error("Failed to fetch bookings:", error);
      if (!silent) showToast("error", error?.message || "Failed to load bookings. Please try again.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchQuery]);

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    const controller = new AbortController();
    fetchBookings(false, controller.signal);
    intervalRef.current = setInterval(() => fetchBookings(true), 30_000);
    return () => {
      controller.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBookings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => setToast({ type, message });

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        const label = newStatus === "CONFIRMED" ? "accepted" : newStatus === "CANCELLED" ? "rejected" : "updated";
        showToast("success", `Booking ${label} successfully. Customer has been notified.`);
        fetchBookings(true);
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      showToast("error", "An error occurred. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
      case "PENDING": return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />New Request</span>;
      case "CONFIRMED": return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Confirmed</span>;
      case "COMPLETED": return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Completed</span>;
      case "CANCELLED": return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Cancelled</span>;
      default: return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast notification */}
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-lg border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="border-b border-slate-200 p-4 sm:p-6 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#047260] focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#047260]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Requests</option>
            <option value="DRAFT">New Requests (Draft)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table/List */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <CalendarIcon className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No bookings found</h3>
            <p className="mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Customer & Service</th>
                <th className="px-6 py-4 font-medium">Schedule</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{booking.service?.name}</div>
                    <div className="flex items-center gap-1 text-slate-500 mt-1 text-xs">
                      <User className="h-3 w-3" />
                      {booking.user?.name}
                    </div>
                    {booking.sourceBookingId && (
                      <div className="text-[10px] text-teal-600 font-semibold mt-1 bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                        Rebooking
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.slotStart ? (
                      <>
                        <div className="flex items-center gap-1.5 text-slate-900 font-medium">
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                          {new Date(booking.slotStart).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ₹{booking.service?.price}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {(booking.status === "PENDING" || booking.status === "DRAFT") && (
                        <>
                          <button
                            onClick={() => handleAction(booking.id, "CONFIRMED")}
                            disabled={actionLoading === booking.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#047260] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#035c4e] disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, "CANCELLED")}
                            disabled={actionLoading === booking.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Decline
                          </button>
                        </>
                      )}
                      
                      {booking.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleAction(booking.id, "COMPLETED")}
                          disabled={actionLoading === booking.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Mark Complete
                        </button>
                      )}

                      {/* Common Actions */}
                      <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50">
          <div className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
