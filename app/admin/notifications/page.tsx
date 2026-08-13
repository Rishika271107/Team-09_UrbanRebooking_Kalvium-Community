"use client";

import { useState, useEffect } from "react";
import { Loader2, Bell, Check, Clock } from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated with new bookings and requests.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
            <p className="mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50 ${!notif.readStatus ? 'bg-teal-50/30' : ''}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!notif.readStatus ? 'bg-[#047260] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-semibold ${!notif.readStatus ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notif.readStatus ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.readStatus && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
