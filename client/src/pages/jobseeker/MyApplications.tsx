import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import ApplicationCard from "../../components/applications/ApplicationCard";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import { toastUI } from "../../components/ui/Toast";
import { listMyApplications, type JobApplication, type JobApplicationStatus } from "../../services/jobs";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";

type StatusSnapshot = Record<string, JobApplicationStatus>;

type StatusNotification = {
  applicationId: number;
  jobTitle: string;
  from: JobApplicationStatus;
  to: JobApplicationStatus;
  detectedAt: string;
};

const statusSnapshotStorageKey = "carrigrow.application_status_snapshot";

type EmployerProfileLike = {
  company_name?: string | null;
};

type EmployerLike = {
  name?: string | null;
  employer_profile?: EmployerProfileLike | null;
  employerProfile?: EmployerProfileLike | null;
};

type JobWithEmployerLike = NonNullable<JobApplication["job"]> & {
  employer?: EmployerLike | null;
};

function formatStatus(status: JobApplicationStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function toStatusSnapshot(applications: JobApplication[]): StatusSnapshot {
  return applications.reduce<StatusSnapshot>((result, application) => {
    result[String(application.id)] = application.status;
    return result;
  }, {});
}

function loadSnapshot(): StatusSnapshot {
  try {
    const raw = window.localStorage.getItem(statusSnapshotStorageKey);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as StatusSnapshot;
  } catch {
    return {};
  }
}

function persistSnapshot(snapshot: StatusSnapshot) {
  window.localStorage.setItem(statusSnapshotStorageKey, JSON.stringify(snapshot));
}

function getCompanyName(application: JobApplication) {
  const job = application.job as JobWithEmployerLike | undefined;
  const profile = job?.employer?.employer_profile ?? job?.employer?.employerProfile;
  const companyName = profile?.company_name?.trim();

  if (companyName) {
    return companyName;
  }

  const fallbackName = job?.employer?.name?.trim();
  if (fallbackName) {
    return fallbackName;
  }

  return "Company unavailable";
}

function computeAverageResponseHours(applications: JobApplication[]) {
  const hours = applications
    .map((application) => {
      if (!application.applied_at || !application.reviewed_at) {
        return null;
      }

      const appliedAt = new Date(application.applied_at).getTime();
      const reviewedAt = new Date(application.reviewed_at).getTime();

      if (Number.isNaN(appliedAt) || Number.isNaN(reviewedAt) || reviewedAt < appliedAt) {
        return null;
      }

      return (reviewedAt - appliedAt) / (1000 * 60 * 60);
    })
    .filter((value): value is number => value !== null);

  if (hours.length === 0) {
    return null;
  }

  return hours.reduce((sum, value) => sum + value, 0) / hours.length;
}

function formatResponseTime(hours: number | null) {
  if (hours === null) {
    return "Awaiting first review";
  }

  if (hours < 24) {
    return `${Math.max(1, Math.round(hours))} hours`;
  }

  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

export default function MyApplications() {
  const { user, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<StatusNotification[]>([]);
  const [withdrawnIds, setWithdrawnIds] = useState<number[]>([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || user.role !== "job_seeker") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadApplications() {
      setLoading(true);

      try {
        const response = await listMyApplications({ per_page: 50 });
        if (cancelled) {
          return;
        }

        const previousSnapshot = loadSnapshot();
        const nextSnapshot = toStatusSnapshot(response.applications);
        const nextNotifications = response.applications
          .map((application) => {
            const previousStatus = previousSnapshot[String(application.id)];
            if (!previousStatus || previousStatus === application.status) {
              return null;
            }

            return {
              applicationId: application.id,
              jobTitle: application.job?.title ?? "Job",
              from: previousStatus,
              to: application.status,
              detectedAt: new Date().toISOString(),
            } satisfies StatusNotification;
          })
          .filter((item): item is StatusNotification => item !== null);

        persistSnapshot(nextSnapshot);
        setApplications(response.applications);
        setNotifications(nextNotifications);

        nextNotifications.forEach((notification) => {
          toastUI.info(`${notification.jobTitle}: ${formatStatus(notification.to)}`);
        });
      } catch (error: unknown) {
        if (!cancelled) {
          toastUI.error(getApiErrorMessage(error, "Could not load your applications."));
          setApplications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const visibleApplications = useMemo(
    () => applications.filter((application) => !withdrawnIds.includes(application.id)),
    [applications, withdrawnIds]
  );

  const analytics = useMemo(() => {
    const total = visibleApplications.length;
    const successful = visibleApplications.filter(
      (application) => application.status === "shortlisted" || application.status === "hired"
    ).length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    const averageResponseHours = computeAverageResponseHours(visibleApplications);

    return {
      total,
      successful,
      successRate,
      averageResponseTime: formatResponseTime(averageResponseHours),
    };
  }, [visibleApplications]);

  function withdrawApplication(target: JobApplication) {
    const shouldWithdraw = window.confirm("Withdraw this application? This base flow removes it from your local dashboard view.");
    if (!shouldWithdraw) {
      return;
    }

    setWithdrawnIds((current) => (current.includes(target.id) ? current : [...current, target.id]));
    toastUI.info("Application withdrawn from this dashboard view.");
  }

  if (loading) {
    return <Loading label="Loading your applications..." />;
  }

  if (!user || user.role !== "job_seeker") {
    return (
      <Card title="My Applications">
        <p className="mb-0 text-muted">This page is available for job seeker accounts.</p>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "My Applications" }]} />

      <Card
        title="My Applications"
        subtitle="Issue #24 base implementation with status timeline, tracking, notifications, and withdraw action."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.localStorage.removeItem(statusSnapshotStorageKey);
              toastUI.info("Status snapshot cleared. Next reload will treat current statuses as baseline.");
            }}
          >
            Reset notifications baseline
          </Button>
        }
      >
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-muted">Total Applications</div>
              <div className="h4 mb-0">{analytics.total}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-muted">Success Rate</div>
              <div className="h4 mb-0">{analytics.successRate}%</div>
              <div className="small text-muted">{analytics.successful} shortlisted/hired</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-muted">Avg Response Time</div>
              <div className="h5 mb-0">{analytics.averageResponseTime}</div>
            </div>
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="alert alert-info" role="alert">
            <div className="fw-semibold mb-2">Status Updates</div>
            <ul className="mb-0 ps-3">
              {notifications.map((notification) => (
                <li key={`${notification.applicationId}-${notification.detectedAt}`}>
                  {notification.jobTitle}: {formatStatus(notification.from)} to {formatStatus(notification.to)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {visibleApplications.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted">No applications to track yet.</div>
        ) : (
          <div className="row g-3">
            {visibleApplications.map((application) => (
              <div key={application.id} className="col-12 col-xl-6">
                <ApplicationCard application={application} companyName={getCompanyName(application)} onWithdraw={withdrawApplication} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
