import type { User, UserRole } from "../types/models";

const roleRoutes: Record<UserRole, string> = {
  job_seeker: "/dashboard/profile",
  employer: "/dashboard/profile",
  mentor: "/dashboard/profile",
  admin: "/dashboard/profile",
};

export function getPostAuthRedirectPath(user: User | null | undefined): string {
  if (!user) {
    return "/dashboard/profile";
  }

  return roleRoutes[user.role] ?? "/dashboard/profile";
}
