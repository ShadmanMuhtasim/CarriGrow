import { useMemo } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Loading";
import MatchBadge from "../components/matching/MatchBadge";
import { calculateJobMatch } from "../components/matching/matchUtils";
import { Link } from "react-router-dom";

const recommendedJobsSeed = [
  {
    id: 101,
    employer_id: 1,
    title: "Frontend Developer",
    description: "Build responsive product flows with React and TypeScript.",
    location: "Remote",
    employment_type: "full_time",
    experience_level: "mid",
    skills_required: ["React", "TypeScript", "Bootstrap", "Communication"],
    status: "published",
  },
  {
    id: 102,
    employer_id: 2,
    title: "Laravel Engineer",
    description: "Work on API delivery, auth flows, and MySQL-backed features.",
    location: "Dhaka",
    employment_type: "full_time",
    experience_level: "mid",
    skills_required: ["Laravel", "MySQL", "REST API", "Testing"],
    status: "published",
  },
  {
    id: 103,
    employer_id: 3,
    title: "Product Designer",
    description: "Design flows, prototypes, and user-facing improvements across the platform.",
    location: "Hybrid",
    employment_type: "contract",
    experience_level: "entry",
    skills_required: ["Figma", "UI Design", "Research", "Communication"],
    status: "published",
  },
] as const;

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  const roleTitle = useMemo(() => {
    if (!user) {
      return "Dashboard";
    }
    if (user.role === "job_seeker") return "Job Seeker Overview";
    if (user.role === "employer") return "Employer Overview";
    if (user.role === "mentor") return "Mentor Overview";
    return "Admin Overview";
  }, [user]);

  if (isLoading || !user) {
    return <Loading label="Loading dashboard..." />;
  }

  const baseStats =
    user.role === "job_seeker"
      ? [
          { label: "Applications", value: "3", icon: "bi-send-check" },
          { label: "Saved Jobs", value: "7", icon: "bi-bookmark-heart" },
          { label: "Upcoming Mentorship", value: "2", icon: "bi-calendar2-check" },
        ]
      : user.role === "employer"
        ? [
            { label: "Active Jobs", value: "4", icon: "bi-briefcase" },
            { label: "Total Applicants", value: "62", icon: "bi-people" },
            { label: "Interviews Scheduled", value: "9", icon: "bi-calendar-event" },
          ]
        : user.role === "mentor"
          ? [
              { label: "Questions Answered", value: "28", icon: "bi-chat-quote" },
              { label: "Active Mentees", value: "11", icon: "bi-people" },
              { label: "Upcoming Sessions", value: "3", icon: "bi-calendar2-check" },
            ]
          : [
              { label: "Users", value: "152", icon: "bi-people" },
              { label: "Flagged Content", value: "4", icon: "bi-flag" },
              { label: "Pending Reviews", value: "6", icon: "bi-shield-check" },
            ];

  const recentActivity =
    user.role === "job_seeker"
      ? ["Applied to Frontend Developer at Sample Company", "Updated profile skills", "Booked mentorship slot with Sample Mentor"]
      : user.role === "employer"
        ? ["Posted Backend Developer role", "Reviewed 12 new applicants", "Shortlisted 3 candidates"]
        : user.role === "mentor"
          ? ["Answered forum question on interview prep", "Updated mentorship availability", "Accepted new mentee request"]
        : ["Reviewed reported forum post", "Changed user role to mentor", "Exported platform summary report"];

  const recommendedJobs =
    user.role === "job_seeker"
      ? recommendedJobsSeed
          .map((job) => ({
            ...job,
            match: calculateJobMatch(job, user.skills),
          }))
          .sort((left, right) => right.match.percentage - left.match.percentage)
          .slice(0, 3)
      : [];

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      <Card
        title={roleTitle}
        subtitle="Milestone 1 role-based dashboard structure"
        actions={<Badge variant="primary">{user.role.replace("_", " ")}</Badge>}
      >
        <div className="row g-3">
          {baseStats.map((stat) => (
            <div key={stat.label} className="col-12 col-md-4">
              <div className="p-3 border rounded-3 h-100">
                <div className="text-muted small mb-1">
                  <i className={`bi ${stat.icon} me-2`} />
                  {stat.label}
                </div>
                <div className="h4 mb-0">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <hr />
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="p-3 border rounded-3 h-100">
              <div className="text-muted small">Logged in as</div>
              <div className="fw-semibold">{user.name}</div>
              <div className="text-muted">{user.email}</div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="p-3 border rounded-3 h-100">
              <div className="text-muted small mb-2">Recent Activity</div>
              <ul className="mb-0 ps-3">
                {recentActivity.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {user.role === "job_seeker" ? (
          <>
            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="fw-semibold">Recommended jobs</div>
                <div className="text-muted small">Base match display section for Issue #27.</div>
              </div>
              <Link to="/dashboard/jobs" className="btn btn-outline-primary btn-sm">
                View all
              </Link>
            </div>
            <div className="row g-3">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="col-12 col-lg-4">
                  <div className="p-3 border rounded-3 h-100">
                    <div className="d-flex justify-content-between gap-2 mb-2">
                      <div className="fw-semibold">{job.title}</div>
                      <MatchBadge percentage={job.match.percentage} />
                    </div>
                    <div className="text-muted small mb-2">
                      {job.location} • {job.employment_type.replace("_", " ")}
                    </div>
                    <div className="small mb-3">
                      Missing skills: {job.match.missingSkills.length > 0 ? job.match.missingSkills.join(", ") : "None"}
                    </div>
                    <Link to="/dashboard/jobs" className="btn btn-sm btn-outline-primary">
                      View match
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
