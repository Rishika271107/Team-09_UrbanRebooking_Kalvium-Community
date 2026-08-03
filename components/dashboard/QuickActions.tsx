"use client";

import Link from "next/link";
import { PlusCircle, History, MapPin, User } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Book Service",
      icon: PlusCircle,
      href: "/dashboard",
      color: "text-[#047260] bg-emerald-50",
    },
    {
      title: "View All Bookings",
      icon: History,
      href: "/bookings",
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Manage Addresses",
      icon: MapPin,
      href: "/dashboard/profile",
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Edit Profile",
      icon: User,
      href: "/dashboard/profile",
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-500">What do you need today?</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {actions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#047260] hover:shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${action.color}`}>
              <action.icon size={24} />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-[#047260]">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
