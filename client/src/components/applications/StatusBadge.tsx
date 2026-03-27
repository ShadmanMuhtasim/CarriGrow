import Badge from "../ui/Badge";

export type ApplicationStatus = "new" | "reviewing" | "shortlisted" | "interview" | "rejected" | "hired";

type StatusBadgeProps = {
  status: ApplicationStatus;
};

const statusVariantMap: Record<ApplicationStatus, "light" | "warning" | "success" | "primary" | "danger" | "secondary"> = {
  new: "light",
  reviewing: "warning",
  shortlisted: "success",
  interview: "primary",
  rejected: "danger",
  hired: "secondary",
};

function labelFromStatus(status: ApplicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{labelFromStatus(status)}</Badge>;
}
