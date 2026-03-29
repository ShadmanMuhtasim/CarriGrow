import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { listPublicJobs } from "../../services/jobs";
import type { Job } from "../../types/models";

const savedJobsStorageKey = "carrigrow.saved_jobs";

function loadSavedJobIds() {
  try {
    const raw = window.localStorage.getItem(savedJobsStorageKey);
    if (!raw) {
      return [] as number[];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as number[];
    }

    return parsed.filter((item): item is number => typeof item === "number" && Number.isFinite(item) && item > 0);
  } catch {
    return [] as number[];
  }
}

function persistSavedJobIds(jobIds: number[]) {
  window.localStorage.setItem(savedJobsStorageKey, JSON.stringify(jobIds));
}

function formatEmploymentType(value: Job["employment_type"]) {
  return value.replace(/_/g, " ");
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

export default function SavedJobs() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => loadSavedJobIds());
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || user.role !== "job_seeker") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSavedJobs() {
      setLoading(true);

      if (savedJobIds.length === 0) {
        setSavedJobs([]);
        setLoading(false);
        return;
      }

      try {
        const response = await listPublicJobs();
        if (cancelled) {
          return;
        }

        const selected = response.jobs.filter((job) => savedJobIds.includes(job.id));
        selected.sort((left, right) => savedJobIds.indexOf(left.id) - savedJobIds.indexOf(right.id));
        setSavedJobs(selected);
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load saved jobs.");
          setSavedJobs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSavedJobs();

    return () => {
      cancelled = true;
    };
  }, [authLoading, savedJobIds, user]);

  const analytics = useMemo(() => {
    const total = savedJobs.length;
    const openJobs = savedJobs.filter((job) => job.status === "published").length;
    const closingSoon = savedJobs.filter((job) => {
      if (!job.application_deadline) {
        return false;
      }
      const deadline = new Date(job.application_deadline).getTime();
      if (Number.isNaN(deadline)) {
        return false;
      }
      const daysLeft = (deadline - Date.now()) / (1000 * 60 * 60 * 24);
      return daysLeft >= 0 && daysLeft <= 7;
    }).length;

    return { total, openJobs, closingSoon };
  }, [savedJobs]);

  function removeSavedJob(jobId: number) {
    setSavedJobIds((current) => {
      const next = current.filter((id) => id !== jobId);
      persistSavedJobIds(next);
      return next;
    });
    toastUI.info("Removed from saved jobs.");
  }

  if (loading) {
    return <Loading label="Loading saved jobs..." />;
  }

  if (!user || user.role !== "job_seeker") {
    return (
      <Card title="Saved Jobs">
        <p className="mb-0 text-muted">This page is available for job seeker accounts.</p>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Saved Jobs" }]} />

      <Card title="Saved Jobs" subtitle="Issue #24 base saved jobs page for bookmarked job tracking and quick apply.">
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-muted">Total Saved</div>
              <div className="h4 mb-0">{analytics.total}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-muted">Open Jobs</div>
              <div className="h4 mb-0">{analytics.openJobs}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="small text-muted">Closing in 7 Days</div>
              <div className="h4 mb-0">{analytics.closingSoon}</div>
            </div>
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted">
            No saved jobs yet. Save jobs from the job browser to track them here.
          </div>
        ) : (
          <div className="row g-3">
            {savedJobs.map((job) => (
              <div key={job.id} className="col-12 col-xl-6">
                <Card className="h-100">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <div>
                      <div className="fw-semibold">{job.title}</div>
                      <div className="small text-muted">
                        {job.location ?? "Remote"} - {formatEmploymentType(job.employment_type)}
                      </div>
                    </div>
                    <span className="badge text-bg-light border">{job.status}</span>
                  </div>

                  <div className="small text-muted mb-3 line-clamp-3">{job.description}</div>

                  <div className="small mb-3">
                    <span className="text-muted">Deadline: </span>
                    <span className="fw-semibold">{formatDate(job.application_deadline)}</span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Link to={`/jobs/${job.id}`}>
                      <Button type="button" variant="outline">
                        View details
                      </Button>
                    </Link>
                    <Link to={`/jobs/${job.id}/apply`}>
                      <Button type="button" variant="primary">
                        Apply
                      </Button>
                    </Link>
                    <Button type="button" variant="danger" onClick={() => removeSavedJob(job.id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
