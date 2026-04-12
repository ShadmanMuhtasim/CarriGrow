import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Card from "../ui/Card";
import type { JobApplication, JobApplicationStatus } from "../../services/jobs";
import StatusTimeline from "./StatusTimeline";

type ApplicationCardProps = {
  application: JobApplication;
  companyName: string;
  onWithdraw?: (application: JobApplication) => void;
  withdrawing?: boolean;
};

const statusClassMap: Record<JobApplicationStatus, string> = {
  applied: "text-bg-primary",
  under_review: "text-bg-warning",
  shortlisted: "text-bg-info",
  rejected: "text-bg-danger",
  hired: "text-bg-success",
};

function formatStatus(status: JobApplicationStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(dateText?: string | null) {
  if (!dateText) {
    return "Not available";
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString();
}

function canWithdraw(status: JobApplicationStatus) {
  return status === "applied" || status === "under_review" || status === "shortlisted";
}

export default function ApplicationCard({ application, companyName, onWithdraw, withdrawing = false }: ApplicationCardProps) {
  const job = application.job;

  return (
    <Card className="h-100">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h3 className="h6 mb-1">{job?.title ?? "Job title unavailable"}</h3>
          <div className="small text-muted">{companyName}</div>
        </div>
        <span className={`badge ${statusClassMap[application.status]} rounded-pill px-3 py-2`}>{formatStatus(application.status)}</span>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <div className="border rounded-3 p-2 h-100">
            <div className="small text-muted">Applied date</div>
            <div className="fw-semibold small">{formatDate(application.applied_at)}</div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="border rounded-3 p-2 h-100">
            <div className="small text-muted">Location</div>
            <div className="fw-semibold small">{job?.location ?? "Not specified"}</div>
          </div>
        </div>
      </div>

      <StatusTimeline status={application.status} />

      <div className="d-flex flex-wrap gap-2 mt-3">
        {job?.id ? (
          <Link to={`/jobs/${job.id}`}>
            <Button type="button" variant="outline">
              View job
            </Button>
          </Link>
        ) : null}
        {canWithdraw(application.status) && onWithdraw ? (
          <Button type="button" variant="danger" loading={withdrawing} onClick={() => onWithdraw(application)}>
            Withdraw
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
