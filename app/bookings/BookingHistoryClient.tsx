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
} from "lucide-react";

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
    month: "2-digit",
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
    currency: "INR",
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

const PAGE_SIZE = 8;

/* ── Dropdown menu component ─────────────────────────────── */
function ActionsMenu({
  booking,
  onRebook,
  onCancel,
}: {
  booking: Booking;
  onRebook: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1 overflow-hidden">
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/bookings/${booking.id}`);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Eye size={14} className="text-slate-400" />
              View Details
            </button>
            {booking.eligibleForRebook && (
              <button
                onClick={() => {
                  setOpen(false);
                  onRebook(booking.id);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw size={14} className="text-slate-400" />
                Rebook
              </button>
            )}
            {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
              <button
                onClick={() => {
                  setOpen(false);
                  onCancel(booking.id);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle size={14} className="text-red-400" />
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

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

/* ── Skeleton row ────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[200, 120, 150, 200, 70, 90, 110].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded bg-slate-100" style={{ width: w }} />
        </td>
      ))}
    </tr>
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

  /* Filter */
  const filtered = useMemo(() => {
    let list = [...bookings];
    if (activeTab === "COMPLETED")
      list = list.filter((b) => b.status === "COMPLETED");
    else if (activeTab === "UPCOMING")
      list = list.filter(
        (b) => b.status === "CONFIRMED" || b.status === "PENDING"
      );
    else if (activeTab === "CANCELLED")
      list = list.filter((b) => b.status === "CANCELLED");
    else if (activeTab === "REBOOKED")
      list = list.filter((b) => b.status === "REBOOKED");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.service.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (b.professional?.user.name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [activeTab, search]);

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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* ── Tabs + Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#047260] text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                {!isLoading && counts[tab.key] > 0 && activeTab !== tab.key && (
                  <span className="ml-1.5 text-xs font-medium opacity-60">
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-60">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by service or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-8 pr-4 text-sm outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50/60">
                {[
                  "Service",
                  "Date",
                  "Professional",
                  "Address",
                  "Price",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-slate-400 text-sm"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                paged.map((booking) => {
                  const meta = getStatusMeta(booking.status);
                  const proName =
                    booking.professional?.user.name ?? "Unassigned";
                  const initials = getInitials(proName);
                  const color = avatarColor(proName);
                  const [datePart, timePart] = formatDate(
                    booking.slotStart ?? booking.createdAt
                  );
                  const shortId = `#b-${booking.id.substring(0, 4)}`;

                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Service */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800 leading-tight">
                          {booking.service.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{shortId}</p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-slate-700">{datePart}</p>
                        <p className="text-xs text-teal-600">{timePart}</p>
                      </td>

                      {/* Professional */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${color}`}
                          >
                            {initials}
                          </div>
                          <span className="text-slate-700 whitespace-nowrap">
                            {proName}
                          </span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3.5 max-w-[180px]">
                        <p className="text-slate-500 text-xs line-clamp-2">
                          {booking.address ?? "221B Baker Street, Bandra West"}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-800">
                        {formatPrice(booking.service.price)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color} ${meta.border}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {booking.eligibleForRebook && (
                            <button
                              onClick={() => handleRebook(booking.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
                            >
                              <RotateCcw size={11} />
                              Rebook
                            </button>
                          )}
                          {booking.status === "COMPLETED" && (
                            <button
                              onClick={() => setReviewId(booking.id)}
                              title="Rate this service"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 transition-colors"
                            >
                              <Star size={12} />
                            </button>
                          )}
                          <ActionsMenu
                            booking={booking}
                            onRebook={handleRebook}
                            onCancel={(id) => setCancelId(id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <span className="text-xs text-slate-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
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
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
