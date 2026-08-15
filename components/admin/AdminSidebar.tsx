"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Bell,
  Star,
  DollarSign,
  BarChart2,
  LogOut,
  ListOrdered,
  UserCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, showBadge: false },
  { name: "Booking Requests", href: "/admin/bookings", icon: ListOrdered, showBadge: false },
  { name: "Calendar", href: "/admin/calendar", icon: Calendar, showBadge: false },
  { name: "Customers", href: "/admin/customers", icon: Users, showBadge: false },
  { name: "Professionals", href: "/admin/professionals", icon: UserCheck, showBadge: false },
  { name: "Services", href: "/admin/services", icon: Briefcase, showBadge: false },
  { name: "Notifications", href: "/admin/notifications", icon: Bell, showBadge: true },
  { name: "Reviews", href: "/admin/reviews", icon: Star, showBadge: false },
  { name: "Earnings", href: "/admin/earnings", icon: DollarSign, showBadge: false },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2, showBadge: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.notifications) {
          setUnreadCount(d.notifications.filter((n: any) => !n.readStatus).length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm max-md:-translate-x-full">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#047260] text-white font-bold text-xl shadow-sm">
          U
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold leading-tight text-slate-900 truncate">
            Urban Company
          </span>
          <span className="text-[11px] font-medium text-[#047260] tracking-wide uppercase">
            Admin Dashboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Admin Navigation" className="flex flex-1 flex-col gap-0.5 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== "/admin");
          const badgeCount = item.showBadge ? unreadCount : 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047260] focus-visible:rounded-xl"
            >
              <div
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#047260] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={18}
                    className={isActive ? "text-white" : "text-slate-400"}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>
                {badgeCount > 0 && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white text-[#047260]"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-3 pb-6">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Logout"
        >
          <LogOut size={18} className="text-slate-400" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}

