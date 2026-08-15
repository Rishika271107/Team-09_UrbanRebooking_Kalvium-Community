"use client";

import { useState, useEffect } from "react";
import { Loader2, Bell, Check, Clock, CreditCard, Activity, CheckCircle2 } from "lucide-react";

type TabKey = "ALL" | "BOOKINGS" | "PAYMENTS" | "UPDATES";

export default function AdminNotificationsPage() {
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setDbNotifications(data.notifications);
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
    if (id.startsWith("mock-")) {
      // Handle mock read state locally
      setDbNotifications(dbNotifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
      return;
    }
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setDbNotifications(dbNotifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mock notifications for payments and updates
  const mockNotifications = [
    {
      id: "mock-1",
      type: "PAYMENT",
      title: "Payment Received",
      message: "You received a payment of ₹1,499 for Home Cleaning service.",
      createdAt: new Date().toISOString(),
      readStatus: false,
    },
    {
      id: "mock-2",
      type: "UPDATE",
      title: "System Update",
      message: "Platform v2.4 is live. Check out the new analytics dashboard features.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      readStatus: true,
    },
    {
      id: "mock-3",
      type: "PAYMENT",
      title: "Weekly Payout Processed",
      message: "Your weekly payout of ₹12,500 has been successfully deposited to your bank account.",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      readStatus: true,
    }
  ];

  // Combine real DB (bookings) + mocks
  const allNotifications = [...dbNotifications, ...mockNotifications.filter(m => !dbNotifications.find(d => d.id === m.id))].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter based on active tab
  const filteredNotifications = allNotifications.filter(n => {
    if (activeTab === "ALL") return true;
    if (activeTab === "BOOKINGS") return !n.type || n.type.includes("BOOKING");
    if (activeTab === "PAYMENTS") return n.type === "PAYMENT";
    if (activeTab === "UPDATES") return n.type === "UPDATE" || n.type === "SYSTEM";
    return true;
  });

  const getIcon = (type: string, read: boolean) => {
    if (type === "PAYMENT") return <CreditCard className="h-5 w-5" />;
    if (type === "UPDATE") return <Activity className="h-5 w-5" />;
    if (type?.includes("BOOKING_CONFIRMED")) return <CheckCircle2 className="h-5 w-5" />;
    return <Bell className="h-5 w-5" />;
  };

  const getIconColor = (type: string, read: boolean) => {
    if (!read) {
      if (type === "PAYMENT") return "bg-blue-600 text-white";
      if (type === "UPDATE") return "bg-purple-600 text-white";
      return "bg-[#047260] text-white";
    }
    return "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated with new bookings, payments, and system updates.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { key: "ALL", label: "All" },
          { key: "BOOKINGS", label: "Bookings" },
          { key: "PAYMENTS", label: "Payments" },
          { key: "UPDATES", label: "System Updates" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[#047260] text-[#047260]"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#047260]" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
            <p className="mt-1">You're all caught up in this category!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50 cursor-pointer ${!notif.readStatus ? 'bg-slate-50/50' : ''}`}
                onClick={() => {
                  markAsRead(notif.id);
                  if (notif.type?.includes("BOOKING")) {
                    window.location.href = notif.type === "BOOKING_REQUEST" ? "/admin/bookings?status=PENDING" : "/admin/bookings";
                  }
                }}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconColor(notif.type, notif.readStatus)}`}>
                  {getIcon(notif.type, notif.readStatus)}
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
                    className="shrink-0 p-1.5 text-slate-400 hover:text-[#047260] hover:bg-teal-50 rounded-md transition-colors"
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
