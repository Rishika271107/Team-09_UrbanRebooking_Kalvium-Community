import React from "react";
import { NotificationCard, NotificationItemProps } from "./NotificationCard";

interface NotificationListProps {
  notifications: NotificationItemProps[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationList({ notifications, onMarkAsRead, onDelete }: NotificationListProps) {
  return (
    <div className="flex flex-col gap-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          {...notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
