"use client";

import { useState } from "react";
import { Bell, Check, Trash2, CheckCircle2 } from "lucide-react";
import { markAsReadAction, markAllAsReadAction, deleteNotificationAction, clearAllNotificationsAction } from "@/app/actions/notification.actions";

export default function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    setIsLoading(true);
    await markAsReadAction(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
    setIsLoading(false);
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllAsReadAction();
    setNotifications(notifications.map(n => ({ ...n, readStatus: true })));
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    await deleteNotificationAction(id);
    setNotifications(notifications.filter(n => n.id !== id));
    setIsLoading(false);
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    await clearAllNotificationsAction();
    setNotifications([]);
    setIsLoading(false);
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Bell size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No notifications</h3>
        <p className="text-slate-500 max-w-sm">You don't have any notifications right now. Check back later for updates.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.readStatus).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : "All caught up!"}
        </span>
        <div className="flex gap-4">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} disabled={isLoading} className="text-sm text-teal-600 font-medium hover:underline flex items-center gap-1">
              <CheckCircle2 size={16} /> Mark all as read
            </button>
          )}
          <button onClick={handleClearAll} disabled={isLoading} className="text-sm text-slate-500 font-medium hover:text-red-500 flex items-center gap-1">
            <Trash2 size={16} /> Clear all
          </button>
        </div>
      </div>
      <div className="divide-y">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 flex gap-4 ${n.readStatus ? 'bg-white' : 'bg-teal-50/20'}`}>
            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${n.readStatus ? 'bg-transparent' : 'bg-teal-500'}`} />
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${n.readStatus ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{n.message}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              {!n.readStatus && (
                <button onClick={() => handleMarkAsRead(n.id)} className="text-teal-600 p-2 hover:bg-teal-50 rounded-lg" title="Mark as read">
                  <Check size={18} />
                </button>
              )}
              <button onClick={() => handleDelete(n.id)} className="text-slate-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-lg" title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
