import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import JobAnalyticsChart from "../../components/jobs/JobAnalyticsChart";
import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import { toastUI } from "../../components/ui/Toast";
import { getEmployerJob } from "../../services/jobs";
import type { Job } from "../../types/models";

function buildSeries(total: number, labels: string[]): Array<{ label: string; value: number }> {
  const safeTotal = Math.max(total, labels.length);
  return labels.map((label, index) => ({
    label,
    value: Math.max(Math.round((safeTotal / labels.length) * (0.6 + (index % 3) * 0.25)), 1),
  }));
}

export default function JobAnalytics() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        const response = await getEmployerJob(jobId);
        if (!cancelled) {
          setJob(response.job);
        }
      } catch {
        toastUI.error("Could not load job analytics.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (Number.isFinite(jobId)) {
      loadJob();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const viewsSeries = useMemo(() => buildSeries(job?.views_count ?? 0, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]), [job?.views_count]);
  const applicationsSeries = useMemo(
    () => buildSeries(job?.applications_count ?? 0, ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]),
    [job?.applications_count]
  );

  const demographics = useMemo(
    () => [
      { label: "Entry level", value: `${Math.max((job?.applications_count ?? 0) * 2, 18)}%` },
      { label: "Mid level", value: `${Math.max(job?.applications_count ?? 0, 24)}%` },
      { label: "Senior level", value: `${Math.max(Math.round((job?.applications_count ?? 0) / 2), 12)}%` },
      { label: "Remote ready", value: `${Math.max(Math.round((job?.views_count ?? 0) / 3), 35)}%` },
    ],
    [job?.applications_count, job?.views_count]
  );

  if (loading) {
    return <Loading label="Loading job analytics..." />;
  }

  if (!job) {
    return (
      <Card title="Analytics unavailable">
        <p className="mb-0 text-muted">The analytics base page is wired, but this job could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Manage Jobs", to: "/dashboard/manage-jobs" },
          { label: "Analytics" },
        ]}
      />

      <Card
        title={`${job.title} analytics`}
        subtitle="Issue #20 analytics scaffold. Replace the placeholder series with real reporting once backend analytics lands."
        actions={<JobStatusBadge status={job.status} />}
      >
        <div className="d-flex flex-wrap gap-2">
          <Link to={`/dashboard/manage-jobs/${job.id}/edit`}>
            <Button variant="outline">Edit job</Button>
          </Link>
          <Link to={`/dashboard/manage-jobs/${job.id}/applicants`}>
            <Button variant="primary">View applicants</Button>
          </Link>
        </div>
      </Card>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <JobAnalyticsChart
            title="Views over time"
            subtitle="Synthetic bar chart using current totals as a base."
            colorClass="bg-primary"
            data={viewsSeries}
          />
        </div>
        <div className="col-12 col-lg-6">
          <JobAnalyticsChart
            title="Applications by day"
            subtitle="Base visualization for later API-backed trend data."
            colorClass="bg-success"
            data={applicationsSeries}
          />
        </div>
      </div>

      <Card title="Applicant demographics" subtitle="Placeholder composition panel for milestone continuity.">
        <div className="row g-3">
          {demographics.map((item) => (
            <div key={item.label} className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="text-muted small">{item.label}</div>
                <div className="h4 mb-0">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
