"use client";

import { useState } from "react";
import { Bell, Check, Trash2, CalendarHeart, Tag, CreditCard, CheckCheck } from "lucide-react";
import { markAsReadAction, markAllAsReadAction, deleteNotificationAction, clearAllNotificationsAction } from "@/app/actions/notification.actions";
import { EmptyState } from "@/components/EmptyState";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  readStatus: boolean;
  date: string;
  iconName: string;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "update",
    title: "Booking confirmed",
    message: "Your Home Cleaning is scheduled for Wednesday 10:00 AM.",
    readStatus: false,
    date: "17/07/2026",
    iconName: "bell",
  },
  {
    id: "n2",
    type: "update",
    title: "Rate your last service",
    message: "How was your session with Sana Iqbal?",
    readStatus: false,
    date: "16/07/2026",
    iconName: "calendar",
  },
  {
    id: "n3",
    type: "offer",
    title: "20% off Salon at Home",
    message: "Book by Sunday to save on your next appointment.",
    readStatus: true,
    date: "14/07/2026",
    iconName: "tag",
  },
  {
    id: "n4",
    type: "payment",
    title: "Payment received",
    message: "Payment of $79 for booking #b-1005 confirmed.",
    readStatus: true,
    date: "15/07/2026",
    iconName: "card",
  },
];

export default function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  // If the DB returns nothing, we use our mock data to show the layout
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications.length > 0 ? initialNotifications : MOCK_NOTIFICATIONS
  );
  const [activeTab, setActiveTab] = useState("All");

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
    try { await markAsReadAction(id); } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, readStatus: true })));
    try { await markAllAsReadAction(); } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    try { await deleteNotificationAction(id); } catch (e) {}
  };

  const tabs = ["All", "Unread", "Updates", "Payments", "Offers"];

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.readStatus;
    if (activeTab === "Updates") return n.type === "update";
    if (activeTab === "Payments") return n.type === "payment";
    if (activeTab === "Offers") return n.type === "offer";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "bell":
        return { icon: <Bell size={20} />, colors: "bg-emerald-50 text-emerald-600" };
      case "calendar":
        return { icon: <CalendarHeart size={20} />, colors: "bg-blue-50 text-blue-500" };
      case "tag":
        return { icon: <Tag size={20} />, colors: "bg-orange-50 text-orange-500" };
      case "card":
        return { icon: <CreditCard size={20} />, colors: "bg-emerald-50 text-emerald-600" };
      default:
        return { icon: <Bell size={20} />, colors: "bg-slate-100 text-slate-500" };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button 
          onClick={handleMarkAllAsRead} 
          className="text-sm font-medium text-slate-700 flex items-center gap-2 hover:text-slate-900 transition-colors"
        >
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          type="no-notifications"
          variant="card"
          description={
            activeTab === "Unread"
              ? "You have no unread notifications. You're all caught up!"
              : `No ${activeTab.toLowerCase()} notifications yet.`
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {filteredNotifications.map((n) => {
            const { icon, colors } = getIcon(n.iconName);
            return (
              <div key={n.id} className="flex gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${colors}`}>
                  {icon}
                </div>
                
                <div className="flex flex-1 justify-between">
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-sm text-slate-500">{n.message}</span>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-xs text-slate-400 mt-1">{n.date}</span>
                    <div className="flex items-center gap-4 mt-2">
                      {!n.readStatus && (
                        <button onClick={() => handleMarkAsRead(n.id)} className="text-slate-600 hover:text-slate-900 transition-colors">
                          <Check size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}