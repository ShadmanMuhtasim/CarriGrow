import { api } from "./api";
import { secrets } from "../secrets";
import type { UserNotification } from "../types/models";

export type NotificationListResponse = {
  data: UserNotification[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  unread_count: number;
};

export type NotificationReadResponse = {
  message: string;
  notification: UserNotification;
  unread_count: number;
};

export type NotificationReadAllResponse = {
  message: string;
  updated_count: number;
  unread_count: number;
};

export async function listNotifications() {
  const { data } = await api.get<NotificationListResponse>("/notifications", {
    params: { per_page: 10 },
  });

  return data;
}

export async function markNotificationRead(notificationId: number) {
  const { data } = await api.put<NotificationReadResponse>(`/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.put<NotificationReadAllResponse>("/notifications/read-all");
  return data;
}

export function buildNotificationStreamUrl(lastId?: number) {
  const url = new URL(`${secrets.apiBaseUrl}/notifications/stream`, window.location.origin);

  if (typeof lastId === "number" && Number.isFinite(lastId) && lastId > 0) {
    url.searchParams.set("last_id", String(lastId));
  }

  return url.toString();
}
