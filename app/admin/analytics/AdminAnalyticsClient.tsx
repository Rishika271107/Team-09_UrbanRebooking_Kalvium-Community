"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, CheckCircle2, RotateCcw, Users } from "lucide-react";

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

const COLORS = ["#0f766e", "#14b8a6", "#5eead4", "#99f6e4", "#ccfbf1", "#f87171"];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", PENDING: "Pending", CONFIRMED: "Confirmed",
  COMPLETED: "Completed", CANCELLED: "Cancelled", DISPUTED: "Disputed",
};

const OUTCOME_LABELS: Record<string, string> = {
  SUCCESS: "Success",
  PROFESSIONAL_UNAVAILABLE: "Pro Unavailable",
  SLOT_BLOCKED: "Slot Blocked",
  SERVICE_INELIGIBLE: "Ineligible",
  FAILED: "Failed",
};

export default function AdminAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
        {error ?? "Failed to load analytics."}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Rebooking Events",
      value: data.totals.totalRebookingEvents,
      icon: <RotateCcw size={22} className="text-teal-600" />,
    },
    {
      label: "Successful Rebookings",
      value: data.totals.successfulRebookings,
      icon: <CheckCircle2 size={22} className="text-emerald-600" />,
    },
    {
      label: "Success Rate",
      value: `${Math.round(data.totals.rebookingSuccessRate * 100)}%`,
      icon: <TrendingUp size={22} className="text-blue-600" />,
    },
    {
      label: "Active Professionals",
      value: data.professionalUtilization.filter((p) => p.active).length,
      icon: <Users size={22} className="text-violet-600" />,
    },
  ];

  const bookingStatusData = data.bookingStatusBreakdown.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
  }));

  const rebookingOutcomeData = data.rebookingOutcomes.map((o) => ({
    name: OUTCOME_LABELS[o.outcome] ?? o.outcome,
    value: o.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4"
          >
            <div className="h-11 w-11 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Booking Status Breakdown</h2>
          {bookingStatusData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingStatusData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {bookingStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Rebooking Outcomes */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Rebooking Outcomes</h2>
          {rebookingOutcomeData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rebookingOutcomeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {rebookingOutcomeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Professional Utilization */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Professional Utilization</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Slots</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Booked</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.professionalUtilization.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    No professionals found.
                  </td>
                </tr>
              ) : (
                data.professionalUtilization.map((pro) => (
                  <tr key={pro.professionalId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{pro.name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          pro.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {pro.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">{pro.totalSlots}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{pro.bookedSlots}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{ width: `${pro.utilizationPct}%` }}
                          />
                        </div>
                        <span className="text-slate-700 font-medium w-8 text-right">
                          {pro.utilizationPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
