import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../Breadcrumbs";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { toastUI } from "../ui/Toast";
import { listMyApplications, type JobApplicationStatus } from "../../services/jobs";
import { useAuth } from "../../hooks/useAuth";

type SuccessRouteState = {
  jobTitle?: string;
  applicationId?: number;
  status?: JobApplicationStatus;
  submittedAt?: string | null;
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

  return date.toLocaleString();
}

export default function ApplicationSuccess() {
  const { user } = useAuth();
  const location = useLocation();
  const { jobId } = useParams();
  const routeState = (location.state as SuccessRouteState | null) ?? {};

  const parsedJobId = useMemo(() => {
    const parsed = Number(jobId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [jobId]);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [status, setStatus] = useState<JobApplicationStatus>(routeState.status ?? "applied");
  const [submittedAt, setSubmittedAt] = useState<string | null | undefined>(routeState.submittedAt);

  useEffect(() => {
    if (!user || user.role !== "job_seeker" || !parsedJobId) {
      return;
    }

    let cancelled = false;

    async function loadLatestStatus() {
      setLoadingStatus(true);
      try {
        const response = await listMyApplications({ per_page: 50 });
        if (cancelled) {
          return;
        }

        const matched = response.applications.find((application) => {
          if (routeState.applicationId && application.id === routeState.applicationId) {
            return true;
          }
          return application.job_id === parsedJobId;
        });

        if (matched) {
          setStatus(matched.status);
          setSubmittedAt(matched.applied_at);
        }
      } catch {
        if (!cancelled) {
          toastUI.info("Application submitted. Live status refresh can be retried later.");
        }
      } finally {
        if (!cancelled) {
          setLoadingStatus(false);
        }
      }
    }

    loadLatestStatus();

    return () => {
      cancelled = true;
    };
  }, [parsedJobId, routeState.applicationId, user]);

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Jobs", to: "/jobs" },
            ...(parsedJobId ? [{ label: "Job Detail", to: `/jobs/${parsedJobId}` }] : []),
            { label: "Application Success" },
          ]}
        />

        <Card
          title="Application submitted"
          subtitle="Issue #22 base success view with status tracking after submission."
          actions={
            <span className={`badge ${statusClassMap[status]} rounded-pill px-3 py-2`}>
              Status: {formatStatus(status)}
            </span>
          }
        >
          <div className="py-2">
            <div className="h4 mb-2">
              <i className="bi bi-check-circle-fill text-success me-2" />
              {routeState.jobTitle ?? "Your selected job"}
            </div>
            <p className="text-muted mb-3">
              Your application has been recorded. You can track status updates from this page and upcoming job seeker tracking pages.
            </p>

            <div className="border rounded-3 p-3 mb-3 bg-light">
              <div className="small text-muted">Submitted at</div>
              <div className="fw-semibold">{formatDate(submittedAt)}</div>
              {loadingStatus ? <div className="small text-muted mt-2">Refreshing latest status...</div> : null}
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/jobs">
                <Button variant="outline">Browse more jobs</Button>
              </Link>
              {parsedJobId ? (
                <Link to={`/jobs/${parsedJobId}`}>
                  <Button variant="primary">Back to job detail</Button>
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
