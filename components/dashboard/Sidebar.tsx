"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Repeat,
  Bell,
  User,
  LogOut,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Booking History", href: "/bookings", icon: History },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white px-4 py-6 shadow-sm transition-transform max-md:-translate-x-full">
      <div className="flex items-center gap-2 px-2 pb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none tracking-tight text-slate-900">
            Urban Company
          </span>
          <span className="text-xs text-slate-500">One-Click Rebooking</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-teal-600" : "text-slate-400"} />
                {item.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut size={18} className="text-slate-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}
