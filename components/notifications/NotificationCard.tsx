import React from "react";
import { Bell, Check, Trash2, CalendarHeart, Tag, CreditCard, Info } from "lucide-react";

export interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  message: string;
  readStatus: boolean;
  date: string;
  iconName: string;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationCard({ 
  id, 
  title, 
  message, 
  readStatus, 
  date, 
  iconName,
  onMarkAsRead,
  onDelete
}: NotificationItemProps) {
  
  const getIcon = (name: string) => {
    switch (name) {
      case "bell": return { icon: <Bell size={20} />, colors: "bg-emerald-50 text-emerald-600" };
      case "calendar": return { icon: <CalendarHeart size={20} />, colors: "bg-blue-50 text-blue-500" };
      case "tag": return { icon: <Tag size={20} />, colors: "bg-orange-50 text-orange-500" };
      case "card": return { icon: <CreditCard size={20} />, colors: "bg-emerald-50 text-emerald-600" };
      case "info": return { icon: <Info size={20} />, colors: "bg-teal-50 text-[#047260]" };
      default: return { icon: <Bell size={20} />, colors: "bg-slate-100 text-slate-500" };
    }
  };

  const { icon, colors } = getIcon(iconName);

  return (
    <div className={`flex gap-4 p-3 -mx-3 rounded-xl transition-colors ${readStatus ? '' : 'bg-slate-50'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${colors}`}>
        {icon}
      </div>
      
      <div className="flex flex-1 justify-between">
        <div className="flex flex-col gap-1 mt-1">
          <span className={`font-bold ${readStatus ? 'text-slate-700' : 'text-slate-900'}`}>{title}</span>
          <span className="text-sm text-slate-500">{message}</span>
        </div>
        
        <div className="flex flex-col items-end justify-between">
          <span className="text-xs text-slate-400 mt-1">{date}</span>
          <div className="flex items-center gap-3 mt-2">
            {!readStatus && onMarkAsRead && (
              <button 
                onClick={() => onMarkAsRead(id)} 
                className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                aria-label="Mark as read"
              >
                <Check size={18} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(id)} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                aria-label="Delete notification"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
