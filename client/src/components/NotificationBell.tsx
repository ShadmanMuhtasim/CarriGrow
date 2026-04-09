import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import type { UserNotification } from "../types/models";

function notificationDestination(notification: UserNotification) {
  if (typeof notification.post_id === "number" && notification.post_id > 0) {
    return `/forum/${notification.post_id}`;
  }

  return "/dashboard";
}

function formatNotificationTime(value?: string | null) {
  if (!value) {
    return "Just now";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "Just now";
  }

  return timestamp.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type NotificationBellProps = {
  className?: string;
};

export default function NotificationBell({ className = "" }: NotificationBellProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, isConnected, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  async function handleNotificationClick(notification: UserNotification) {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch {
        // Keep navigation responsive even if read sync fails.
      }
    }

    setIsOpen(false);
    navigate(notificationDestination(notification));
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
    } finally {
      setIsOpen(false);
    }
  }

  return (
    <div className={`dropdown ${className}`.trim()}>
      <button
        className="btn btn-outline-primary position-relative notification-trigger"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label="Notifications"
      >
        <i className="bi bi-bell" />
        {unreadCount > 0 ? <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
      </button>

      <div className={`dropdown-menu dropdown-menu-end p-0 notification-menu ${isOpen ? "show" : ""}`}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <div>
            <div className="fw-semibold">Notifications</div>
            <div className="small text-muted d-flex align-items-center gap-2">
              <span className={`notification-status-dot ${isConnected ? "is-live" : "is-waiting"}`} />
              <span>{isConnected ? "Live updates on" : "Reconnecting..."}</span>
            </div>
          </div>
          {unreadCount > 0 ? (
            <button className="btn btn-sm btn-link text-decoration-none" type="button" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="notification-list">
          {isLoading ? <div className="px-3 py-3 text-muted small">Loading notifications...</div> : null}

          {!isLoading && notifications.length === 0 ? (
            <div className="px-3 py-3 text-muted small">No notifications yet.</div>
          ) : null}

          {!isLoading
            ? notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? "" : "is-unread"}`.trim()}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                >
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="fw-semibold text-start">{notification.title}</div>
                    {!notification.is_read ? <span className="notification-unread-dot" /> : null}
                  </div>
                  <div className="small text-muted text-start mt-1">{notification.message}</div>
                  <div className="small text-muted text-start mt-2">{formatNotificationTime(notification.created_at)}</div>
                </button>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
