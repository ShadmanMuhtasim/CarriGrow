import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toastUI } from "../../components/ui/Toast";
import { getPublicJob } from "../../services/jobs";
import type { Job, Skill } from "../../types/models";

const savedJobsStorageKey = "carrigrow.saved_jobs";

type JobWithRelations = Job & {
  skills?: Skill[];
};

function loadSavedJobs() {
  try {
    const raw = window.localStorage.getItem(savedJobsStorageKey);
    if (!raw) {
      return [] as number[];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as number[];
    }

    return parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  } catch {
    return [] as number[];
  }
}

function persistSavedJobs(jobIds: number[]) {
  window.localStorage.setItem(savedJobsStorageKey, JSON.stringify(jobIds));
}

function collectSkillNames(job: Job) {
  const withRelations = job as JobWithRelations;
  if (Array.isArray(withRelations.skills) && withRelations.skills.length > 0) {
    return withRelations.skills.map((skill) => skill.name);
  }
  return (job.skills_required ?? []).filter((skill): skill is string => Boolean(skill));
}

function formatEmploymentType(value: Job["employment_type"]) {
  return value.replace(/_/g, " ");
}

function formatSalary(job: Job) {
  const min = Number(job.salary_min ?? 0);
  const max = Number(job.salary_max ?? 0);
  const currency = job.salary_currency ?? "BDT";
  if (min <= 0 && max <= 0) {
    return "Not specified";
  }
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
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

export default function JobDetail() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const parsedJobId = useMemo(() => {
    const parsed = Number(jobId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [jobId]);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>(() => loadSavedJobs());

  useEffect(() => {
    if (!parsedJobId) {
      setLoading(false);
      setJob(null);
      return;
    }

    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      try {
        const response = await getPublicJob(parsedJobId);
        if (!cancelled) {
          setJob(response.job);
        }
      } catch {
        if (!cancelled) {
          setJob(null);
          toastUI.error("Could not load this job detail.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [parsedJobId]);

  function toggleSavedJob() {
    if (!job) {
      return;
    }

    setSavedJobs((current) => {
      const alreadySaved = current.includes(job.id);
      const next = alreadySaved ? current.filter((id) => id !== job.id) : [...current, job.id];
      persistSavedJobs(next);
      toastUI.info(alreadySaved ? "Removed from saved jobs." : "Saved job for later.");
      return next;
    });
  }

  if (loading) {
    return (
      <div className="container py-4">
        <Card title="Job Detail">
          <div className="placeholder-glow mb-3">
            <span className="placeholder col-7" />
          </div>
          <div className="placeholder-glow mb-2">
            <span className="placeholder col-5" />
          </div>
          <div className="placeholder-glow mb-2">
            <span className="placeholder col-12" />
          </div>
          <div className="placeholder-glow">
            <span className="placeholder col-10" />
          </div>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-4">
        <div className="vstack gap-3">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: "Not Found" }]} />
          <Card title="Job not found">
            <p className="text-muted mb-3">This job is unavailable or no longer published.</p>
            <Button type="button" variant="outline" onClick={() => navigate("/jobs")}>
              Back to jobs
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const skills = collectSkillNames(job);
  const isSaved = savedJobs.includes(job.id);

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: job.title }]} />

        <Card
          title={job.title}
          subtitle={`${job.location ?? "Remote"} - ${formatEmploymentType(job.employment_type)}`}
          actions={
            <div className="d-flex gap-2">
              <Link to="/jobs">
                <Button type="button" variant="outline">
                  Back
                </Button>
              </Link>
              <Link to={`/jobs/${job.id}/apply`}>
                <Button type="button" variant="primary">
                  Apply Now
                </Button>
              </Link>
              <Button type="button" variant={isSaved ? "secondary" : "outline"} onClick={toggleSavedJob}>
                {isSaved ? "Saved" : "Save Job"}
              </Button>
            </div>
          }
        >
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-muted">Salary</div>
                <div className="fw-semibold">{formatSalary(job)}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-muted">Experience</div>
                <div className="fw-semibold">{job.experience_level ?? "Not specified"}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border rounded-3 p-3 h-100">
                <div className="small text-muted">Application deadline</div>
                <div className="fw-semibold">{formatDate(job.application_deadline)}</div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="h6">Description</h3>
            <p className="text-muted mb-0">{job.description}</p>
          </div>

          <div className="mb-3">
            <h3 className="h6">Requirements</h3>
            <p className="text-muted mb-0">{job.requirements ?? "No requirements listed yet."}</p>
          </div>

          <div className="mb-3">
            <h3 className="h6">Responsibilities</h3>
            <p className="text-muted mb-0">{job.responsibilities ?? "No responsibilities listed yet."}</p>
          </div>

          <div>
            <h3 className="h6">Skills</h3>
            <div className="d-flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span key={`${job.id}-${skill}`} className="badge text-bg-light border rounded-pill">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-muted">No skill tags yet.</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
