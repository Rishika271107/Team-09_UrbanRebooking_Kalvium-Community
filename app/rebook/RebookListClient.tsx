"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RotateCw, Loader2, Star, Clock, Tag } from "lucide-react";

interface Booking {
  id: string;
  service: { name: string; category: string };
  slotStart: string | null;
  status: string;
  professional: { user: { name: string } } | null;
}

interface PaginatedResponse {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Demo bookings shown for demonstration purposes ──────────────────────────
const DEMO_BOOKINGS = [
  {
    id: "demo-1",
    service: { name: "Full Home Deep Cleaning", category: "Cleaning" },
    slotStart: "2025-03-14T10:00:00Z",
    professional: "Priya Sharma",
    rating: 4.9,
    price: "₹1,299",
    badge: "Most Booked",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    avatar: "PS",
    avatarBg: "bg-teal-600",
  },
  {
    id: "demo-2",
    service: { name: "AC Service & Deep Clean", category: "Appliance Repair" },
    slotStart: "2025-04-02T09:00:00Z",
    professional: "Rahul Verma",
    rating: 4.7,
    price: "₹799",
    badge: "Top Rated",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    avatar: "RV",
    avatarBg: "bg-blue-600",
  },
  {
    id: "demo-3",
    service: { name: "Bathroom & Kitchen Sanitisation", category: "Cleaning" },
    slotStart: "2025-04-20T08:30:00Z",
    professional: "Sunita Patel",
    rating: 4.8,
    price: "₹649",
    badge: "",
    badgeColor: "",
    avatar: "SP",
    avatarBg: "bg-purple-600",
  },
  {
    id: "demo-4",
    service: { name: "Haircut & Styling at Home", category: "Beauty" },
    slotStart: "2025-05-05T11:00:00Z",
    professional: "Anjali Mehta",
    rating: 5.0,
    price: "₹549",
    badge: "5★ Professional",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    avatar: "AM",
    avatarBg: "bg-pink-600",
  },
  {
    id: "demo-5",
    service: { name: "Electrician – Wiring & Fixtures", category: "Electrical" },
    slotStart: "2025-05-18T14:00:00Z",
    professional: "Vikram Singh",
    rating: 4.6,
    price: "₹449",
    badge: "",
    badgeColor: "",
    avatar: "VS",
    avatarBg: "bg-orange-600",
  },
  {
    id: "demo-6",
    service: { name: "Pest Control – Full Home", category: "Pest Control" },
    slotStart: "2025-06-01T08:00:00Z",
    professional: "Deepak Kumar",
    rating: 4.8,
    price: "₹999",
    badge: "Trending",
    badgeColor: "bg-green-50 text-green-700 border-green-200",
    avatar: "DK",
    avatarBg: "bg-green-700",
  },
  {
    id: "demo-7",
    service: { name: "Sofa & Carpet Steam Cleaning", category: "Cleaning" },
    slotStart: "2025-06-14T10:30:00Z",
    professional: "Meena Joshi",
    rating: 4.7,
    price: "₹849",
    badge: "",
    badgeColor: "",
    avatar: "MJ",
    avatarBg: "bg-indigo-600",
  },
  {
    id: "demo-8",
    service: { name: "Plumbing – Pipe Repair & Fitting", category: "Plumbing" },
    slotStart: "2025-07-03T09:00:00Z",
    professional: "Arjun Nair",
    rating: 4.5,
    price: "₹399",
    badge: "",
    badgeColor: "",
    avatar: "AN",
    avatarBg: "bg-cyan-700",
  },
  {
    id: "demo-9",
    service: { name: "Facial & Skin Care at Home", category: "Beauty" },
    slotStart: "2025-07-19T15:00:00Z",
    professional: "Kavita Rao",
    rating: 4.9,
    price: "₹699",
    badge: "Customer Favourite",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    avatar: "KR",
    avatarBg: "bg-rose-600",
  },
  {
    id: "demo-10",
    service: { name: "Water Purifier Installation", category: "Appliance" },
    slotStart: "2025-08-01T11:00:00Z",
    professional: "Suresh Gupta",
    rating: 4.6,
    price: "₹349",
    badge: "",
    badgeColor: "",
    avatar: "SG",
    avatarBg: "bg-slate-600",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RebookListClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/history?page=${p}`);
      const data: PaginatedResponse = await res.json();
      if (!res.ok) throw new Error("Failed to load bookings");
      const eligible = data.bookings.filter((b) => b.status === "COMPLETED");
      setBookings(eligible);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(page); }, [fetchBookings, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>;
  }

  // ── Render: real completed bookings at the top, then demo cards ────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Real bookings (if any) */}
      {bookings.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Your Past Bookings</h2>
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-900">{b.service.name}</span>
                <span className="text-sm text-slate-500">
                  {b.professional?.user.name ?? "—"}
                  {b.slotStart ? ` • ${new Date(b.slotStart).toLocaleDateString("en-IN")}` : ""}
                </span>
              </div>
              <Link
                href={`/rebook/${b.id}`}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                <RotateCw size={16} /> Rebook
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Demo / popular services */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          {bookings.length > 0 ? "Popular Services You Might Like" : "Past Services — Quick Rebook"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {DEMO_BOOKINGS.map((d) => (
            <div
              key={d.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200"
            >
              {/* Badge */}
              {d.badge && (
                <span className={`absolute top-4 right-4 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${d.badgeColor}`}>
                  {d.badge}
                </span>
              )}

              {/* Top row: avatar + name */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${d.avatarBg}`}>
                  {d.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug pr-16">{d.service.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{d.service.category}</p>
                </div>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {d.professional.split(" ").map((n) => n[0]).join("")}
                  </span>
                  {d.professional}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  {d.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(d.slotStart!)}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {d.price}
                </span>
              </div>

              {/* Rebook button */}
              <Link
                href={`/rebook/${d.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-95 transition-all"
              >
                <RotateCw size={15} />
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}