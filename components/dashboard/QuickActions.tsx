"use client";

import Link from "next/link";
import { RotateCw, CalendarDays, Bell, User } from "lucide-react";

const actions = [
  { label: "Rebook", href: "/rebook", icon: RotateCw, color: "bg-teal-50 text-teal-700" },
  { label: "Bookings", href: "/bookings", icon: CalendarDays, color: "bg-blue-50 text-blue-700" },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, color: "bg-amber-50 text-amber-700" },
  { label: "Profile", href: "/dashboard/profile", icon: User, color: "bg-violet-50 text-violet-700" },
];

export function QuickActions() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${a.color}`}>
              <a.icon size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}