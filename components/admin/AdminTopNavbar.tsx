"use client";

import { Bell, Search, X, Calendar, CheckCircle, XCircle, Star, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  iconName: string | null;
  readStatus: boolean;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "BOOKING_REQUEST": return <Calendar className={`${cls} text-teal-600`} />;
    case "BOOKING_CONFIRMED": return <CheckCircle className={`${cls} text-emerald-600`} />;
    case "BOOKING_CANCELLED": return <XCircle className={`${cls} text-red-500`} />;
    case "BOOKING_COMPLETED": return <Star className={`${cls} text-amber-500`} />;
    default: return <Clock className={`${cls} text-slate-400`} />;
  }
}

export function AdminTopNavbar() {
  const { data: session } = useSession();
  const user = session?.user;

  const [query, setQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silently ignore
    }
  }, []);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
    );
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch { /* ignore */ }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

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
            suppressHydrationWarning
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 focus:outline-none"
              aria-label="Clear search"
              suppressHydrationWarning
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) fetchNotifications(); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Notifications"
            suppressHydrationWarning
          >
            <Bell size={20} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#047260] hover:underline font-medium focus:outline-none"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">New booking requests will appear here</p>
                  </div>
                ) : (
                  notifications.slice(0, 15).map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${notif.readStatus ? "opacity-60" : "bg-teal-50/30"}`}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.type.includes("BOOKING")) {
                          window.location.href = notif.type === "BOOKING_REQUEST" ? "/admin/bookings?status=PENDING" : "/admin/bookings";
                        }
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <NotifIcon type={notif.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900 leading-tight">{notif.title}</span>
                          {!notif.readStatus && (
                            <span className="h-2 w-2 rounded-full bg-[#047260] mt-1 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-[#047260] transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#047260] text-white font-bold text-sm">
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
