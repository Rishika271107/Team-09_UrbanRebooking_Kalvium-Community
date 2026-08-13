"use client";

import { Bell, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function AdminTopNavbar() {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [query, setQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Booking Request", message: "Customer requested a booking.", isRead: false, time: "2m ago" }
  ]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-3 sm:px-4 md:px-6 shadow-sm gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:w-96 md:flex-none">
        <div className="relative w-full max-w-[160px] sm:max-w-xs md:max-w-md">
          <label htmlFor="top-search" className="sr-only">Search</label>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            id="top-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for bookings, customers..."
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-10 text-sm outline-none transition-colors focus:border-[#047260] focus:bg-white focus:ring-1 focus:ring-[#047260]"
          />
          {query && (
            <button 
              onClick={() => setQuery("")} 
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={20} aria-hidden="true" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute right-2.5 top-2.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 border border-white"></span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                  className="text-xs text-[#047260] hover:underline font-medium focus:outline-none"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${notif.isRead ? 'opacity-60' : ''}`}
                      onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{notif.title}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{notif.message}</span>
                        </div>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[#047260] mt-1 shrink-0"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2">{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                <Link href="/admin/notifications" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-sm">
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "AD"}
          </div>
          <div className="hidden flex-col items-start sm:flex max-w-[120px] md:max-w-none">
            <span className="text-sm font-semibold text-slate-900 truncate">{user?.name || "Admin"}</span>
            <span className="text-xs text-slate-500 truncate">{user?.role || "Admin"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
