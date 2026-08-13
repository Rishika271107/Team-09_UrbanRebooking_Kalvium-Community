"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Clock,
  Bell,
  Star,
  DollarSign,
  BarChart,
  LogOut,
  List
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Booking Requests", href: "/admin/bookings", icon: List },
  { name: "Calendar", href: "/admin/calendar", icon: Calendar },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Services", href: "/admin/services", icon: Briefcase },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Earnings", href: "/admin/earnings", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-900 shadow-sm max-md:-translate-x-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047260] text-white font-bold text-xl">
          U
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight text-white">
            Urban Company
          </span>
          <span className="text-xs text-slate-400">Admin Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main Navigation" className="flex flex-1 flex-col gap-2 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link key={item.name} href={item.href} aria-current={isActive ? "page" : undefined} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047260] focus-visible:rounded-xl">
              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#047260] text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} aria-hidden="true" />
                  {item.name}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 pb-8">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Logout"
        >
          <LogOut size={20} className="text-slate-400" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
