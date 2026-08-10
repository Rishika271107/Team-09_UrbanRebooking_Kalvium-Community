"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RotateCw, Loader2 } from "lucide-react";

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

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <p className="text-slate-500">No completed bookings to rebook.</p>
        <Link href="/bookings" className="mt-4 inline-block text-sm font-medium text-teal-600 hover:underline">
          View all bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <RotateCw size={16} /> Rebook
          </Link>
        </div>
      ))}
    </div>
  );
}