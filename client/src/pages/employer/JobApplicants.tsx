import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import Badge from "../../components/ui/Badge";
import { toastUI } from "../../components/ui/Toast";
import { getEmployerJob } from "../../services/jobs";
import type { Job } from "../../types/models";

type ApplicantRecord = {
  id: number;
  name: string;
  match: number;
  stage: "new" | "reviewing" | "shortlisted";
  location: string;
};

function buildApplicants(job: Job): ApplicantRecord[] {
  const count = Math.max(job.applications_count ?? 0, 3);
  return Array.from({ length: count }).slice(0, 6).map((_, index) => ({
    id: index + 1,
    name: `Applicant ${index + 1}`,
    match: Math.max(55, 88 - index * 6),
    stage: index === 0 ? "shortlisted" : index < 3 ? "reviewing" : "new",
    location: job.location ?? "Remote",
  }));
}

const stageVariant = {
  new: "light",
  reviewing: "warning",
  shortlisted: "success",
} as const;

export default function JobApplicants() {
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
        toastUI.error("Could not load job applicants.");
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

  const applicants = useMemo(() => (job ? buildApplicants(job) : []), [job]);

  if (loading) {
    return <Loading label="Loading applicants..." />;
  }

  if (!job) {
    return (
      <Card title="Applicants unavailable">
        <p className="mb-0 text-muted">The applicants base page is wired, but this job could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Manage Jobs", to: "/dashboard/manage-jobs" },
          { label: "Applicants" },
        ]}
      />

      <Card
        title={`Applicants for ${job.title}`}
        subtitle="Issue #20 base applicants page. Replace the placeholder rows with Issue #21+#23 application data later."
        actions={
          <Link to={`/dashboard/manage-jobs/${job.id}/analytics`}>
            <Button variant="outline">View analytics</Button>
          </Link>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Total applicants</div>
              <div className="display-6 mb-0">{job.applications_count ?? applicants.length}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Shortlisted</div>
              <div className="display-6 mb-0">{applicants.filter((applicant) => applicant.stage === "shortlisted").length}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Average match</div>
              <div className="display-6 mb-0">
                {Math.round(applicants.reduce((sum, applicant) => sum + applicant.match, 0) / Math.max(applicants.length, 1))}%
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Location</th>
                <th>Match</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant.id}>
                  <td>
                    <div className="fw-semibold">{applicant.name}</div>
                    <div className="text-muted small">Profile and resume integration can be connected later.</div>
                  </td>
                  <td>{applicant.location}</td>
                  <td>{applicant.match}%</td>
                  <td>
                    <Badge variant={stageVariant[applicant.stage]}>{applicant.stage}</Badge>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => toastUI.info("Applicant detail view will be expanded later.")}>
                        View
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => toastUI.success("Shortlist action scaffolded.")}>
                        Shortlist
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
