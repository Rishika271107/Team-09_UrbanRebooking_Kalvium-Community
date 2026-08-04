"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Repeat,
  Bell,
  User,
} from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/bookings", icon: History },
    { name: "Rebook", href: "/rebook", icon: Repeat },
    { name: "Alerts", href: "/dashboard/notifications", icon: Bell, badge: 2 },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-around border-t border-slate-200 bg-white px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="group relative flex h-full min-w-[64px] flex-1 flex-col items-center justify-center gap-1 text-slate-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047260] focus-visible:rounded-lg"
          >
            <div
              className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                isActive ? "bg-[#047260]/10 text-[#047260]" : "hover:bg-slate-100"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-[#047260]" : "text-slate-600 group-hover:text-slate-800"} />
              
              {item.badge && (
                <div aria-label={`${item.badge} unread`} className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {item.badge}
                </div>
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight ${
                isActive ? "text-[#047260]" : "text-slate-600 group-hover:text-slate-800"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
