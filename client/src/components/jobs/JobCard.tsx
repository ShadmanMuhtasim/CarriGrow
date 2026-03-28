import { Link } from "react-router-dom";
import Button from "../ui/Button";
import type { Job, Skill } from "../../types/models";

type JobCardView = "grid" | "list";

type JobWithRelations = Job & {
  skills?: Skill[];
};

type JobCardProps = {
  job: Job;
  view: JobCardView;
  isSaved: boolean;
  onToggleSave: (jobId: number) => void;
};

function formatEmploymentType(value: Job["employment_type"]) {
  return value.replace(/_/g, " ");
}

function formatSalary(job: Job) {
  const min = Number(job.salary_min ?? 0);
  const max = Number(job.salary_max ?? 0);
  const currency = job.salary_currency ?? "BDT";
  if (min <= 0 && max <= 0) {
    return "Salary not specified";
  }
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

function collectSkillNames(job: Job) {
  const withRelations = job as JobWithRelations;
  if (Array.isArray(withRelations.skills) && withRelations.skills.length > 0) {
    return withRelations.skills.map((skill) => skill.name);
  }
  return (job.skills_required ?? []).filter((skill): skill is string => Boolean(skill));
}

function formatPostedAt(job: Job) {
  if (!job.created_at) {
    return "Recently posted";
  }

  const date = new Date(job.created_at);
  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  return `Posted ${date.toLocaleDateString()}`;
}

export default function JobCard({ job, view, isSaved, onToggleSave }: JobCardProps) {
  const skills = collectSkillNames(job).slice(0, 5);

  return (
    <div className={`card border-0 shadow-sm h-100 ${view === "list" ? "flex-md-row" : ""}`}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 mb-2">
          <div>
            <h3 className="h6 fw-semibold mb-1">{job.title}</h3>
            <div className="text-muted small">
              {job.location ?? "Remote"} - {formatEmploymentType(job.employment_type)}
            </div>
          </div>
          <span className="badge text-bg-light border">{job.status}</span>
        </div>

        <p className="text-muted small mb-2">{job.description}</p>

        <div className="text-muted small mb-3">
          <div>{formatSalary(job)}</div>
          <div>{formatPostedAt(job)}</div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <span key={`${job.id}-${skill}`} className="badge text-bg-light border rounded-pill">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-muted small">Skills not listed yet.</span>
          )}
        </div>

        <div className="mt-auto d-flex flex-wrap gap-2">
          <Link to={`/jobs/${job.id}`}>
            <Button type="button" variant="outline">
              View details
            </Button>
          </Link>
          <Button type="button" variant={isSaved ? "secondary" : "outline"} onClick={() => onToggleSave(job.id)}>
            {isSaved ? "Saved" : "Save Job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
