import Badge from "../ui/Badge";

export type ApplicationStatus = "applied" | "under_review" | "shortlisted" | "rejected" | "hired";

type StatusBadgeProps = {
  status: ApplicationStatus;
};

const statusVariantMap: Record<ApplicationStatus, "light" | "warning" | "success" | "primary" | "danger" | "secondary"> = {
  applied: "light",
  under_review: "warning",
  shortlisted: "success",
  hired: "primary",
  rejected: "danger",
};

const statusLabelMap: Record<ApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

function labelFromStatus(status: ApplicationStatus): string {
  return statusLabelMap[status];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{labelFromStatus(status)}</Badge>;
}
