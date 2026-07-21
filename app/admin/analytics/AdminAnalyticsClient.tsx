"use client";

import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  totals: {
    totalRebookingEvents: number;
    successfulRebookings: number;
    rebookingSuccessRate: number;
  };
  rebookingOutcomes: { outcome: string; count: number }[];
  bookingStatusBreakdown: { status: string; count: number }[];
  slotTypeBreakdown: { slotType: string; count: number }[];
  professionalUtilization: {
    professionalId: string;
    name: string;
    active: boolean;
    totalSlots: number;
    bookedSlots: number;
    utilizationPct: number;
  }[];
}

const OUTCOME_COLORS: Record<string, string> = {
  SUCCESS: "#047260",
  PROFESSIONAL_UNAVAILABLE: "#F59E0B",
  SLOT_BLOCKED: "#EF4444",
  SERVICE_INELIGIBLE: "#94A3B8",
  FAILED: "#DC2626",
};

export default function AdminAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error ?? "Failed to load analytics.");
        setData(json as AnalyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operations dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Rebooking outcomes, booking status, and professional utilization.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm font-semibold text-[#047260] hover:underline"
          >
            Sign out
          </button>
        </header>

        {loading && <p className="text-sm text-slate-500">Loading analytics…</p>}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {data && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-xs text-slate-500">Rebooking success rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {Math.round(data.totals.rebookingSuccessRate * 100)}%
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-xs text-slate-500">Total rebooking attempts</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {data.totals.totalRebookingEvents}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-xs text-slate-500">Successful rebookings</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {data.totals.successfulRebookings}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Rebooking outcomes</h2>
                {data.rebookingOutcomes.length === 0 ? (
                  <p className="text-sm text-slate-500">No rebooking events yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.rebookingOutcomes}
                        dataKey="count"
                        nameKey="outcome"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={(entry) => `${entry.outcome}: ${entry.count}`}
                      >
                        {data.rebookingOutcomes.map((entry) => (
                          <Cell
                            key={entry.outcome}
                            fill={OUTCOME_COLORS[entry.outcome] ?? "#64748B"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Booking status breakdown</h2>
                {data.bookingStatusBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-500">No bookings yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.bookingStatusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#047260" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Professional utilization</h2>
              {data.professionalUtilization.length === 0 ? (
                <p className="text-sm text-slate-500">No professionals yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.professionalUtilization} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="utilizationPct" fill="#1AA394" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Calendar slot mix</h2>
              <ul className="flex gap-6 text-sm text-slate-600">
                {data.slotTypeBreakdown.map((s) => (
                  <li key={s.slotType}>
                    <span className="font-semibold text-slate-900">{s.count}</span> {s.slotType.toLowerCase()}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
