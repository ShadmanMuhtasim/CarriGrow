import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import { toastUI } from "../../components/ui/Toast";
import { listEmployerJobs } from "../../services/jobs";
import type { Job } from "../../types/models";

export default function ApplicantsOverview() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        const response = await listEmployerJobs();
        if (!cancelled) {
          setJobs(response.jobs);
        }
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load jobs for applicants view.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const rankedJobs = useMemo(
    () => [...jobs].sort((left, right) => (right.applications_count ?? 0) - (left.applications_count ?? 0)),
    [jobs]
  );

  if (loading) {
    return <Loading label="Loading applicants overview..." />;
  }

  return (
    <Card title="Applicants" subtitle="Choose a job to review applicants, statuses, and candidate details.">
      {rankedJobs.length === 0 ? (
        <div className="border rounded-3 p-4 text-center text-muted">
          You have not posted any jobs yet. Create a job first to receive applicants.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Job</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankedJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="fw-semibold">{job.title}</div>
                    <div className="small text-muted">{job.location ?? "Remote / TBD"}</div>
                  </td>
                  <td>
                    <span className="badge text-bg-light border">{job.status}</span>
                  </td>
                  <td>{job.applications_count ?? 0}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <Link to={`/dashboard/manage-jobs/${job.id}/applicants`}>
                        <Button type="button" variant="primary">Open applicants</Button>
                      </Link>
                      <Link to={`/dashboard/manage-jobs/${job.id}/analytics`}>
                        <Button type="button" variant="outline">Analytics</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
