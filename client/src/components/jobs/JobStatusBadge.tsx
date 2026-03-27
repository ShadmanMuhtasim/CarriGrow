import Badge from "../ui/Badge";
import type { JobStatus } from "../../types/models";

type JobStatusBadgeProps = {
  status: JobStatus;
};

const statusVariantMap: Record<JobStatus, "primary" | "warning" | "secondary" | "success"> = {
  published: "success",
  draft: "warning",
  closed: "secondary",
  filled: "primary",
};

function statusLabel(status: JobStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function JobStatusBadge({ status }: JobStatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{statusLabel(status)}</Badge>;
}
