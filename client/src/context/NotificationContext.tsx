import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { toastUI } from "../components/ui/Toast";
import {
  buildNotificationStreamUrl,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications";
import type { UserNotification } from "../types/models";

type NotificationContextValue = {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

type NotificationStreamPayload = {
  notification?: UserNotification;
  unread_count?: number;
  reconnect?: boolean;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function parseStreamPayload(event: MessageEvent<string>): NotificationStreamPayload | null {
  try {
    return JSON.parse(event.data) as NotificationStreamPayload;
  } catch {
    return null;
  }
}

function mergeNotifications(nextNotification: UserNotification, existing: UserNotification[]) {
  const merged = [nextNotification, ...existing.filter((notification) => notification.id !== nextNotification.id)];
  return merged.slice(0, 10);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const streamRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const lastEventIdRef = useRef(0);
  const seenNotificationIdsRef = useRef(new Set<number>());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      streamRef.current?.close();
      streamRef.current = null;

      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      setIsConnected(false);
      lastEventIdRef.current = 0;
      seenNotificationIdsRef.current = new Set<number>();
      return;
    }

    let cancelled = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeStream = () => {
      streamRef.current?.close();
      streamRef.current = null;
    };

    const scheduleReconnect = () => {
      clearReconnectTimer();

      reconnectTimerRef.current = window.setTimeout(() => {
        if (!cancelled) {
          openStream();
        }
      }, 3000);
    };

    const openStream = () => {
      closeStream();

      const source = new EventSource(buildNotificationStreamUrl(lastEventIdRef.current || undefined), {
        withCredentials: true,
      });

      streamRef.current = source;

      source.onopen = () => {
        if (!cancelled) {
          setIsConnected(true);
        }
      };

      source.addEventListener("connected", (event) => {
        const payload = parseStreamPayload(event as MessageEvent<string>);
        if (cancelled || !payload) {
          return;
        }

        if (typeof payload.unread_count === "number") {
          setUnreadCount(payload.unread_count);
        }
        setIsConnected(true);
      });

      source.addEventListener("notification.created", (event) => {
        const payload = parseStreamPayload(event as MessageEvent<string>);
        if (cancelled || !payload?.notification) {
          return;
        }

        const nextNotification = payload.notification;
        lastEventIdRef.current = Math.max(lastEventIdRef.current, nextNotification.id);

        setNotifications((current) => mergeNotifications(nextNotification, current));

        if (typeof payload.unread_count === "number") {
          setUnreadCount(payload.unread_count);
        } else if (!nextNotification.is_read) {
          setUnreadCount((current) => current + 1);
        }

        if (!seenNotificationIdsRef.current.has(nextNotification.id)) {
          seenNotificationIdsRef.current.add(nextNotification.id);
          toastUI.info(nextNotification.title);
        }
      });

      source.addEventListener("notifications.unread_count", (event) => {
        const payload = parseStreamPayload(event as MessageEvent<string>);
        if (cancelled || !payload || typeof payload.unread_count !== "number") {
          return;
        }

        setUnreadCount(payload.unread_count);
      });

      source.addEventListener("stream.end", () => {
        if (cancelled) {
          return;
        }

        setIsConnected(false);
        closeStream();
        scheduleReconnect();
      });

      source.onerror = () => {
        if (cancelled) {
          return;
        }

        setIsConnected(false);
        closeStream();
        scheduleReconnect();
      };
    };

    async function bootstrapNotifications() {
      setIsLoading(true);

      try {
        const response = await listNotifications();

        if (cancelled) {
          return;
        }

        setNotifications(response.data);
        setUnreadCount(response.unread_count);
        lastEventIdRef.current = response.data.reduce((maxId, notification) => Math.max(maxId, notification.id), 0);
        seenNotificationIdsRef.current = new Set(response.data.map((notification) => notification.id));
      } catch {
        if (!cancelled) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          openStream();
        }
      }
    }

    void bootstrapNotifications();

    return () => {
      cancelled = true;
      clearReconnectTimer();
      closeStream();
    };
  }, [isAuthenticated, user]);

  async function refresh() {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const response = await listNotifications();
    setNotifications(response.data);
    setUnreadCount(response.unread_count);
    lastEventIdRef.current = response.data.reduce((maxId, notification) => Math.max(maxId, notification.id), 0);
    seenNotificationIdsRef.current = new Set(response.data.map((notification) => notification.id));
  }

  async function markAsRead(notificationId: number) {
    const response = await markNotificationRead(notificationId);

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read_at: response.notification.read_at ?? new Date().toISOString(),
              is_read: true,
            }
          : notification
      )
    );
    setUnreadCount(response.unread_count);
  }

  async function markAllAsRead() {
    const response = await markAllNotificationsRead();

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read_at: notification.read_at ?? new Date().toISOString(),
        is_read: true,
      }))
    );
    setUnreadCount(response.unread_count);
  }

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    refresh,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
