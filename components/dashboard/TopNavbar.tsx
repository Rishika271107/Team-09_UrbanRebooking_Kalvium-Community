"use client";

import { Bell, Search } from "lucide-react";
import { useSession } from "next-auth/react";

export function TopNavbar({ notificationCount }: { notificationCount: number }) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4 md:w-96 md:flex-none">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services, bookings..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="hidden h-8 w-[1px] bg-slate-200 sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium text-slate-900">{user?.name || "Loading..."}</span>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-600">{(user as any)?.label || "Customer"}</span>
          </div>
          <img
            src={user?.image || "https://i.pravatar.cc/150"}
            alt="User avatar"
            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
