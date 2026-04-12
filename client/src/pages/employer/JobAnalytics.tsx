import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import JobAnalyticsChart from "../../components/jobs/JobAnalyticsChart";
import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import { toastUI } from "../../components/ui/Toast";
import { getEmployerJob, listJobApplicationsForEmployer } from "../../services/jobs";
import type { Job } from "../../types/models";

type AnalyticsStat = { label: string; value: string };

export default function JobAnalytics() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const [job, setJob] = useState<Job | null>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [applicantStats, setApplicantStats] = useState<AnalyticsStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        const [jobResponse, applicationsResponse] = await Promise.all([
          getEmployerJob(jobId),
          listJobApplicationsForEmployer(jobId, { per_page: 50 }),
        ]);

        const applications = applicationsResponse.applications ?? [];
        const byStatus = new Map<string, number>();
        applications.forEach((application) => {
          byStatus.set(application.status, (byStatus.get(application.status) ?? 0) + 1);
        });

        const applicantSnapshot: AnalyticsStat[] = [
          { label: "Total applicants", value: String(applications.length) },
          { label: "Under review", value: String(byStatus.get("under_review") ?? 0) },
          { label: "Shortlisted", value: String(byStatus.get("shortlisted") ?? 0) },
          { label: "Hired", value: String(byStatus.get("hired") ?? 0) },
        ];

        if (!cancelled) {
          setJob(jobResponse.job);
          setApplicationsCount(applications.length);
          setApplicantStats(applicantSnapshot);
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

  const viewsSeries = useMemo(
    () => [{ label: "Total views", value: Math.max(job?.views_count ?? 0, 0) }],
    [job?.views_count]
  );
  const applicationsSeries = useMemo(
    () => [{ label: "Total applications", value: Math.max(applicationsCount, 0) }],
    [applicationsCount]
  );

  if (loading) {
    return <Loading label="Loading job analytics..." />;
  }

  if (!job) {
    return (
      <Card title="Analytics unavailable">
        <p className="mb-0 text-muted">This job could not be loaded.</p>
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
        subtitle="View performance trends for this job posting."
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
            title="Views"
            subtitle="Live total views tracked for this job."
            colorClass="bg-primary"
            data={viewsSeries}
          />
        </div>
        <div className="col-12 col-lg-6">
          <JobAnalyticsChart
            title="Applications"
            subtitle="Live total applications for this job."
            colorClass="bg-success"
            data={applicationsSeries}
          />
        </div>
      </div>

      <Card title="Applicant snapshot" subtitle="Current applicant status counts from live records.">
        <div className="row g-3">
          {applicantStats.map((item) => (
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
