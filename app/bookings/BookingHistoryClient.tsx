"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCcw,
  MoreVertical,
  Star,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Filter,
  ArrowUpDown,
  HelpCircle,
  Loader2
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/components/ErrorComponents";

/* ── Types ───────────────────────────────────────────────── */
interface Booking {
  id: string;
  status: string;
  slotStart: string | null;
  createdAt: string;
  address: string | null;
  service: { id: string; name: string; category: string; price: number };
  professional: {
    id: string;
    user: { name: string };
  } | null;
  eligibleForRebook: boolean;
}

/* ── Helpers ─────────────────────────────────────────────── */
const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  CONFIRMED: {
    label: "Upcoming",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  PENDING: {
    label: "Upcoming",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

function getStatusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status,
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
    }
  );
}

function formatDate(iso: string | null) {
  if (!iso) return ["–", ""];
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return [datePart, timePart];
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(p);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/* ── Tab definition ──────────────────────────────────────── */
type TabKey = "ALL" | "COMPLETED" | "UPCOMING" | "CANCELLED" | "REBOOKED";
const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "COMPLETED", label: "Completed" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REBOOKED", label: "Rebooked" },
];

const PAGE_SIZE = 9; // Grid of 3 on desktop -> 3 rows = 9 cards

/* ── Cancel confirmation modal ───────────────────────────── */
function CancelModal({
  bookingId,
  onClose,
  onSuccess,
}: {
  bookingId: string;
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleCancel = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
          method: "PATCH",
        });
        if (!res.ok) throw new Error("Failed");
        onSuccess(bookingId);
        onClose();
      } catch {
        setError("Could not cancel booking. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Cancel Booking?
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          This action cannot be undone. Your booking will be marked as
          cancelled.
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {isPending ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Review modal ────────────────────────────────────────── */
function ReviewModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    startTransition(async () => {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      setDone(true);
      setTimeout(onClose, 1200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {done ? (
          <div className="text-center py-4">
            <p className="text-teal-600 font-semibold text-lg">
              Thank you for your review! ⭐
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Leave a Review
            </h3>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star
                    size={24}
                    className={
                      s <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || rating === 0}
                className="flex-1 py-2.5 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 disabled:opacity-60"
              >
                {isPending ? "Submitting…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton Card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
      <div className="h-32 w-full bg-slate-200"></div>
      <div className="flex flex-col p-5 gap-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="h-5 w-1/2 bg-slate-200 rounded"></div>
          <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
        </div>
        <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100">
          <div className="h-9 flex-1 bg-slate-200 rounded-lg"></div>
          <div className="h-9 flex-1 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function BookingHistoryClient() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [sortOption, setSortOption] = useState("LATEST"); 
  const [dateFilter, setDateFilter] = useState("ALL_TIME");

  const handleDownloadInvoice = async (bookingId: string) => {
    setDownloadingId(bookingId);
    toast({
      type: "info",
      title: "Generating Invoice",
      message: "Please wait while we prepare your invoice..."
    });
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDownloadingId(null);
    toast({
      type: "success",
      title: "Invoice Downloaded",
      message: `Invoice for booking #${bookingId.substring(0, 8)} saved.`
    });
  };

  const handleContactSupport = () => {
    toast({
      type: "info",
      title: "Contacting Support",
      message: "Redirecting you to our 24/7 customer support line..."
    });
  }; 

  /* Fetch bookings */
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/bookings/history")
      .then((r) => r.json())
      .then((d) => {
        if (d.bookings) setBookings(d.bookings);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  /* Optimistic cancel update */
  const handleCancelSuccess = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "CANCELLED", eligibleForRebook: false }
          : b
      )
    );
  };

  /* Tab counts */
  const counts = useMemo(
    () => ({
      ALL: bookings.length,
      COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
      UPCOMING: bookings.filter(
        (b) => b.status === "CONFIRMED" || b.status === "PENDING"
      ).length,
      CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
      REBOOKED: bookings.filter((b) => b.status === "REBOOKED").length,
    }),
    [bookings]
  );

  /* Filter & Sort */
  const filteredAndSorted = useMemo(() => {
    let list = [...bookings];
    
    // Status tab filter
    if (activeTab === "COMPLETED") list = list.filter((b) => b.status === "COMPLETED");
    else if (activeTab === "UPCOMING") list = list.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
    else if (activeTab === "CANCELLED") list = list.filter((b) => b.status === "CANCELLED");
    else if (activeTab === "REBOOKED") list = list.filter((b) => b.status === "REBOOKED");

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => 
        b.service.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.professional?.user.name ?? "").toLowerCase().includes(q)
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== "ALL_TIME") {
      const cutoffDate = new Date();
      if (dateFilter === "30_DAYS") cutoffDate.setDate(now.getDate() - 30);
      else if (dateFilter === "3_MONTHS") cutoffDate.setMonth(now.getMonth() - 3);
      else if (dateFilter === "6_MONTHS") cutoffDate.setMonth(now.getMonth() - 6);

      list = list.filter(b => {
        const d = new Date(b.slotStart ?? b.createdAt);
        return d >= cutoffDate;
      });
    }

    // Sort
    list.sort((a, b) => {
      const dateA = new Date(a.slotStart ?? a.createdAt).getTime();
      const dateB = new Date(b.slotStart ?? b.createdAt).getTime();
      
      switch(sortOption) {
        case "LATEST": return dateB - dateA;
        case "OLDEST": return dateA - dateB;
        case "PRICE_DESC": return b.service.price - a.service.price;
        case "PRICE_ASC": return a.service.price - b.service.price;
        case "SERVICE_AZ": return a.service.name.localeCompare(b.service.name);
        default: return dateB - dateA;
      }
    });

    return list;
  }, [bookings, activeTab, search, dateFilter, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paged = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [activeTab, search, dateFilter, sortOption]);

  const handleRebook = (id: string) => router.push(`/rebook/${id}`);

  return (
    <>
      {cancelId && (
        <CancelModal
          bookingId={cancelId}
          onClose={() => setCancelId(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
      {reviewId && (
        <ReviewModal
          bookingId={reviewId}
          onClose={() => setReviewId(null)}
        />
      )}

      <div className="flex flex-col gap-6">
        
        {/* ── Filters & Search Bar ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#047260] text-white"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  {!isLoading && counts[tab.key] > 0 && activeTab !== tab.key && (
                    <span className="ml-1.5 text-xs font-medium opacity-60 bg-slate-200 px-1.5 py-0.5 rounded-full">
                      {counts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 overflow-x-auto no-scrollbar">
            {/* Sort Filter */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-shrink-0">
              <ArrowUpDown size={14} className="text-slate-400 mr-2" />
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-sm text-slate-700 font-medium outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="LATEST">Latest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="SERVICE_AZ">Service: A to Z</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-shrink-0">
              <Filter size={14} className="text-slate-400 mr-2" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-700 font-medium outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="ALL_TIME">All Time</option>
                <option value="30_DAYS">Last 30 Days</option>
                <option value="3_MONTHS">Last 3 Months</option>
                <option value="6_MONTHS">Last 6 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Grid Layout ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <EmptyState
            type={search || dateFilter !== "ALL_TIME" || activeTab !== "ALL" ? "no-search-results" : "no-bookings"}
            onPrimary={search || dateFilter !== "ALL_TIME" || activeTab !== "ALL" ? () => {
              setSearch("");
              setDateFilter("ALL_TIME");
              setActiveTab("ALL");
              setSortOption("LATEST");
            } : undefined}
            primaryLabel={search || dateFilter !== "ALL_TIME" || activeTab !== "ALL" ? "Clear Filters" : undefined}
            variant="card"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paged.map((booking, index) => {
              const meta = getStatusMeta(booking.status);
              const proName = booking.professional?.user.name ?? "Unassigned";
              const initials = getInitials(proName);
              const color = avatarColor(proName);
              const [datePart, timePart] = formatDate(booking.slotStart ?? booking.createdAt);
              const shortId = `#b-${booking.id.substring(0, 4)}`;

              return (
                <div key={booking.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-teal-200 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Service Image placeholder */}
                  <div className="h-32 w-full bg-slate-100 flex flex-col items-center justify-center border-b border-slate-100 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-slate-200/50 mix-blend-overlay transition-transform duration-500 group-hover:scale-105"></div>
                     <span className="text-slate-400 font-medium relative z-10">Service Image</span>
                     <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${meta.bg} ${meta.color} border ${meta.border} z-10`}>
                       {meta.label}
                     </span>
                  </div>
                  
                  <div className="flex flex-col p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{booking.service.name}</h3>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">{shortId}</p>
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {formatPrice(booking.service.price)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <span>{datePart}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-400" />
                        <span>{timePart}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-slate-400 min-w-4" />
                        <span className="line-clamp-1" title={booking.address ?? "No address"}>
                          {booking.address ?? "221B Baker Street, Bandra West"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 pt-3 border-t border-slate-100">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${color}`}>
                          {initials}
                        </div>
                        <span className="font-medium text-slate-700">{proName}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      <button 
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                        className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                      
                      {booking.eligibleForRebook && (
                        <button 
                          onClick={() => handleRebook(booking.id)}
                          className="flex-1 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold text-teal-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={14} />
                          Rebook
                        </button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <button 
                          onClick={() => setReviewId(booking.id)}
                          className="flex-1 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-750 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Star size={14} />
                          Rate Professional
                        </button>
                      )}

                      {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                        <button 
                          onClick={() => setCancelId(booking.id)}
                          className="flex-1 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      )}

                      <button 
                        className="flex-none p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors disabled:opacity-50"
                        title="Download Invoice"
                        onClick={() => handleDownloadInvoice(booking.id)}
                        disabled={downloadingId === booking.id}
                      >
                        {downloadingId === booking.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <FileText size={16} />
                        )}
                      </button>

                      <button 
                        className="flex-none p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                        title="Contact Support"
                        onClick={handleContactSupport}
                      >
                        <HelpCircle size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && filteredAndSorted.length > PAGE_SIZE && (
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-slate-600">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredAndSorted.length)} to {Math.min(page * PAGE_SIZE, filteredAndSorted.length)} of {filteredAndSorted.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    page === i + 1
                      ? "bg-[#047260] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
