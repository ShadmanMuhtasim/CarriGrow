import { api } from "./api";
import type { User, UserRole } from "../types/models";

export type AdminSummary = {
  users: number;
  jobs: number;
  applications: number;
  forumPosts: number;
};

export type GrowthPoint = {
  label: string;
  users: number;
  jobs: number;
  applications: number;
};

export type ModerationStatus = "pending" | "approved" | "removed";

export type ModerationItem = {
  id: number;
  content_type: "forum_post" | "forum_reply";
  content_id: number;
  reason: string;
  excerpt: string;
  reported_by: string;
  status: ModerationStatus;
  created_at: string;
};

export type SystemLogLevel = "info" | "warning" | "error";

export type SystemLogEntry = {
  id: number;
  level: SystemLogLevel;
  actor: string;
  action: string;
  target: string;
  created_at: string;
};

export type AdminReport = {
  id: number;
  title: string;
  type: "weekly" | "monthly" | "custom";
  status: "ready" | "processing";
  generated_at: string;
};

type UserListParams = {
  search?: string;
  role?: UserRole | "all";
  status?: User["status"] | "all";
};

type LogsParams = {
  search?: string;
  level?: SystemLogLevel | "all";
};

const usersStorageKey = "carrigrow.admin.users";
const moderationStorageKey = "carrigrow.admin.moderation";

const fallbackUsers: User[] = [
  { id: 1, name: "Musa", email: "musa@carrigrow.local", role: "admin", status: "active", skills: [] },
  { id: 2, name: "Ahbab", email: "ahbab@carrigrow.local", role: "employer", status: "active", skills: [] },
  { id: 3, name: "Shadman", email: "shadman@carrigrow.local", role: "mentor", status: "active", skills: [] },
  { id: 4, name: "Ishtiak", email: "ishtiak@carrigrow.local", role: "job_seeker", status: "active", skills: [] },
  { id: 5, name: "Nafis", email: "nafis@carrigrow.local", role: "job_seeker", status: "banned", skills: [] },
  { id: 6, name: "Rahat", email: "rahat@carrigrow.local", role: "employer", status: "active", skills: [] },
];

const fallbackModeration: ModerationItem[] = [
  {
    id: 9001,
    content_type: "forum_post",
    content_id: 31,
    reason: "Spam links",
    excerpt: "Earn guaranteed money by clicking this external link...",
    reported_by: "User #41",
    status: "pending",
    created_at: "2026-04-09T08:22:00Z",
  },
  {
    id: 9002,
    content_type: "forum_reply",
    content_id: 84,
    reason: "Harassment",
    excerpt: "Your question is stupid and you should quit coding...",
    reported_by: "User #16",
    status: "pending",
    created_at: "2026-04-09T10:10:00Z",
  },
  {
    id: 9003,
    content_type: "forum_post",
    content_id: 12,
    reason: "Off-topic",
    excerpt: "Selling used keyboards in bulk...",
    reported_by: "User #8",
    status: "approved",
    created_at: "2026-04-07T03:00:00Z",
  },
];

const fallbackGrowth: GrowthPoint[] = [
  { label: "Nov", users: 92, jobs: 24, applications: 118 },
  { label: "Dec", users: 108, jobs: 33, applications: 165 },
  { label: "Jan", users: 124, jobs: 39, applications: 204 },
  { label: "Feb", users: 139, jobs: 46, applications: 249 },
  { label: "Mar", users: 153, jobs: 54, applications: 301 },
  { label: "Apr", users: 168, jobs: 61, applications: 356 },
];

const fallbackLogs: SystemLogEntry[] = [
  { id: 1, level: "info", actor: "admin:musa", action: "role_change", target: "user:24 -> mentor", created_at: "2026-04-10T08:30:00Z" },
  { id: 2, level: "warning", actor: "system", action: "rate_limit_triggered", target: "auth/login", created_at: "2026-04-10T08:10:00Z" },
  { id: 3, level: "error", actor: "system", action: "email_delivery_failed", target: "notification#883", created_at: "2026-04-09T23:45:00Z" },
  { id: 4, level: "info", actor: "admin:ahbab", action: "content_moderated", target: "forum_post:31", created_at: "2026-04-09T12:22:00Z" },
];

const fallbackReports: AdminReport[] = [
  { id: 11, title: "Weekly User Growth", type: "weekly", status: "ready", generated_at: "2026-04-08T02:00:00Z" },
  { id: 12, title: "Monthly Hiring Funnel", type: "monthly", status: "ready", generated_at: "2026-04-01T02:00:00Z" },
  { id: 13, title: "Moderation Risk Snapshot", type: "custom", status: "processing", generated_at: "2026-04-10T01:40:00Z" },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeCloneUsers(users: User[]) {
  return users.map((user) => ({ ...user, skills: [...user.skills] }));
}

function readLocalUsers(): User[] {
  try {
    const raw = window.localStorage.getItem(usersStorageKey);
    if (!raw) {
      return safeCloneUsers(fallbackUsers);
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return safeCloneUsers(fallbackUsers);
    }

    const users = parsed.filter((value): value is User => isObject(value) && typeof value.id === "number" && typeof value.email === "string") as User[];
    return safeCloneUsers(users);
  } catch {
    return safeCloneUsers(fallbackUsers);
  }
}

function writeLocalUsers(users: User[]) {
  window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function readLocalModeration(): ModerationItem[] {
  try {
    const raw = window.localStorage.getItem(moderationStorageKey);
    if (!raw) {
      return [...fallbackModeration];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [...fallbackModeration];
    }

    return parsed.filter((value): value is ModerationItem => isObject(value) && typeof value.id === "number") as ModerationItem[];
  } catch {
    return [...fallbackModeration];
  }
}

function writeLocalModeration(items: ModerationItem[]) {
  window.localStorage.setItem(moderationStorageKey, JSON.stringify(items));
}

function filterUsers(users: User[], params: UserListParams) {
  const search = params.search?.trim().toLowerCase() ?? "";

  return users.filter((user) => {
    if (params.role && params.role !== "all" && user.role !== params.role) {
      return false;
    }

    if (params.status && params.status !== "all" && user.status !== params.status) {
      return false;
    }

    if (search) {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });
}

export async function getAdminSummary() {
  try {
    const { data } = await api.get("/admin/analytics/summary");
    if (isObject(data)) {
      return data as { summary: AdminSummary };
    }
  } catch {
    // Use fallback below.
  }

  const users = readLocalUsers();
  return {
    summary: {
      users: users.length,
      jobs: 61,
      applications: 356,
      forumPosts: 127,
    },
  };
}

export async function getAdminGrowth() {
  try {
    const { data } = await api.get("/admin/analytics/growth");
    if (isObject(data) && Array.isArray(data.points)) {
      return { points: data.points as GrowthPoint[] };
    }
  } catch {
    // Use fallback below.
  }

  return { points: [...fallbackGrowth] };
}

export async function listAdminUsers(params: UserListParams = {}) {
  try {
    const { data } = await api.get("/admin/users", { params });

    if (isObject(data) && Array.isArray(data.data)) {
      return { users: data.data as User[] };
    }

    if (isObject(data) && Array.isArray(data.users)) {
      return { users: data.users as User[] };
    }
  } catch {
    // Use fallback below.
  }

  const users = filterUsers(readLocalUsers(), params);
  return { users };
}

export async function updateAdminUserRole(userId: number, role: UserRole) {
  try {
    const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
    if (isObject(data) && isObject(data.user)) {
      return { user: data.user as unknown as User };
    }
  } catch {
    // Use fallback below.
  }

  const users = readLocalUsers();
  const nextUsers = users.map((user) => (user.id === userId ? { ...user, role } : user));
  writeLocalUsers(nextUsers);

  const updated = nextUsers.find((user) => user.id === userId);
  if (!updated) {
    throw new Error("User not found");
  }

  return { user: updated };
}

export async function toggleAdminUserStatus(userId: number) {
  try {
    const { data } = await api.patch(`/admin/users/${userId}/status`);
    if (isObject(data) && isObject(data.user)) {
      return { user: data.user as unknown as User };
    }
  } catch {
    // Use fallback below.
  }

  const users = readLocalUsers();
  const nextUsers: User[] = users.map((user) =>
    user.id === userId
      ? {
          ...user,
          status: (user.status === "active" ? "banned" : "active") as User["status"],
        }
      : user
  );
  writeLocalUsers(nextUsers);

  const updated = nextUsers.find((user) => user.id === userId);
  if (!updated) {
    throw new Error("User not found");
  }

  return { user: updated };
}

export async function getAdminUserDetail(userId: number) {
  try {
    const { data } = await api.get(`/admin/users/${userId}`);
    if (isObject(data) && isObject(data.user)) {
      return { user: data.user as unknown as User };
    }
  } catch {
    // Use fallback below.
  }

  const user = readLocalUsers().find((item) => item.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  return { user };
}

export async function listModerationItems(status: ModerationStatus | "all" = "all") {
  try {
    const { data } = await api.get("/admin/moderation", { params: { status } });

    if (isObject(data) && Array.isArray(data.items)) {
      return { items: data.items as ModerationItem[] };
    }
  } catch {
    // Use fallback below.
  }

  const all = readLocalModeration();
  const items = status === "all" ? all : all.filter((item) => item.status === status);
  return { items };
}

export async function resolveModerationItem(itemId: number, action: "approve" | "remove") {
  try {
    const { data } = await api.post(`/admin/moderation/${itemId}/resolve`, { action });

    if (isObject(data) && isObject(data.item)) {
      return { item: data.item as ModerationItem };
    }
  } catch {
    // Use fallback below.
  }

  const items = readLocalModeration();
  const nextStatus: ModerationStatus = action === "approve" ? "approved" : "removed";
  const nextItems = items.map((item) => (item.id === itemId ? { ...item, status: nextStatus } : item));
  writeLocalModeration(nextItems);

  const updated = nextItems.find((item) => item.id === itemId);
  if (!updated) {
    throw new Error("Moderation item not found");
  }

  return { item: updated };
}

export async function listSystemLogs(params: LogsParams = {}) {
  try {
    const { data } = await api.get("/admin/system-logs", { params });

    if (isObject(data) && Array.isArray(data.logs)) {
      return { logs: data.logs as SystemLogEntry[] };
    }
  } catch {
    // Use fallback below.
  }

  const search = params.search?.trim().toLowerCase() ?? "";
  const logs = fallbackLogs.filter((log) => {
    if (params.level && params.level !== "all" && log.level !== params.level) {
      return false;
    }

    if (search) {
      const haystack = `${log.actor} ${log.action} ${log.target}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });

  return { logs };
}

export async function listAdminReports() {
  try {
    const { data } = await api.get("/admin/reports");

    if (isObject(data) && Array.isArray(data.reports)) {
      return { reports: data.reports as AdminReport[] };
    }
  } catch {
    // Use fallback below.
  }

  return { reports: [...fallbackReports] };
}
