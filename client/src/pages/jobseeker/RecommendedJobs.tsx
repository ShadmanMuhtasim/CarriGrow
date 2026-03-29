import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import MatchBadge from "../../components/matching/MatchBadge";
import MatchDetails from "../../components/matching/MatchDetails";
import { calculateJobMatch } from "../../components/matching/matchUtils";
import { useAuth } from "../../hooks/useAuth";
import { listPublicJobs } from "../../services/jobs";
import { toastUI } from "../../components/ui/Toast";
import type { Job } from "../../types/models";

export default function RecommendedJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        const response = await listPublicJobs();
        if (!cancelled) {
          setJobs(response.jobs);
        }
      } catch {
        toastUI.error("Could not load recommended jobs.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const scoredJobs = useMemo(() => {
    const userSkills = user?.skills ?? [];
    return jobs
      .map((job) => ({
        job,
        match: calculateJobMatch(job, userSkills),
      }))
      .sort((left, right) => right.match.percentage - left.match.percentage);
  }, [jobs, user?.skills]);

  if (loading) {
    return <Loading label="Loading recommended jobs..." />;
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Recommended Jobs" }]} />

      <Card
        title="Recommended jobs"
        subtitle="Issue #27 base implementation for match scores, missing skills, and skill-gap visibility."
      >
        <div className="row g-3">
          {scoredJobs.length > 0 ? (
            scoredJobs.map(({ job, match }) => (
              <div key={job.id} className="col-12 col-xl-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="d-flex justify-content-between gap-3 mb-2">
                    <div>
                      <div className="fw-semibold">{job.title}</div>
                      <div className="text-muted small">
                        {job.location ?? "Remote"} • {job.employment_type.replace("_", " ")}
                      </div>
                    </div>
                    <MatchBadge percentage={match.percentage} />
                  </div>

                  <p className="text-muted small">{job.description}</p>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {(job.skills_required ?? []).slice(0, 5).map((skill) => (
                      <span key={skill} className="badge text-bg-light border rounded-pill">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => setSelectedJob(job)}>
                      Match details
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => toastUI.info("Apply flow can be connected after Issue #22/#24.")}>
                      Save / Apply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="border rounded-3 p-4 text-center text-muted">No recommended jobs available yet.</div>
            </div>
          )}
        </div>
      </Card>

      {selectedJob ? (
        <MatchDetails
          open={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          match={calculateJobMatch(selectedJob, user?.skills ?? [])}
        />
      ) : null}
    </div>
  );
}
