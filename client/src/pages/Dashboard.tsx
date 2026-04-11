import { useEffect, useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Loading from "../components/Loading";
import MatchBadge from "../components/matching/MatchBadge";
import { calculateJobMatch } from "../components/matching/matchUtils";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listForumPosts } from "../services/forum";
import { listEmployerJobs, listJobApplicationsForEmployer, listMyApplications, listPublicJobs } from "../services/jobs";
import { getAdminSummary } from "../services/admin";
import { toastUI } from "../components/ui/Toast";
import type { Job, User } from "../types/models";

type StatItem = {
  label: string;
  value: string;
  icon: string;
};

const savedJobsStorageKey = "carrigrow.saved_jobs";

function loadSavedJobsCount(): number {
  try {
    const raw = window.localStorage.getItem(savedJobsStorageKey);
    if (!raw) {
      return 0;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return 0;
    }

    return parsed.filter((item): item is number => typeof item === "number" && Number.isFinite(item) && item > 0).length;
  } catch {
    return 0;
  }
}

function formatJobStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const roleTitle = useMemo(() => {
    if (!user) {
      return "Dashboard";
    }
    if (user.role === "job_seeker") return "Job Seeker Overview";
    if (user.role === "employer") return "Employer Overview";
    if (user.role === "mentor") return "Mentor Overview";
    return "Admin Overview";
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const currentUser: User = user;

    let cancelled = false;

    async function loadRoleMetrics() {
      setMetricsLoading(true);

      try {
        if (currentUser.role === "employer") {
          const jobsResponse = await listEmployerJobs();
          const jobs = jobsResponse.jobs ?? [];
          const applicationResponses = await Promise.all(
            jobs.map((job) => listJobApplicationsForEmployer(job.id, { per_page: 50 }))
          );

          const totalApplicants = applicationResponses.reduce(
            (sum, response) => sum + response.applications.length,
            0
          );
          const shortlistedCount = applicationResponses.reduce(
            (sum, response) =>
              sum + response.applications.filter((application) => application.status === "shortlisted").length,
            0
          );
          const activeJobs = jobs.filter((job) => job.status === "published").length;
          const latestJob = [...jobs].sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
          })[0];

          if (!cancelled) {
            setStats([
              { label: "Active Jobs", value: String(activeJobs), icon: "bi-briefcase" },
              { label: "Total Applicants", value: String(totalApplicants), icon: "bi-people" },
              { label: "Shortlisted", value: String(shortlistedCount), icon: "bi-person-check" },
            ]);

            setRecentActivity([
              latestJob ? `Posted ${latestJob.title}` : "No jobs posted yet",
              totalApplicants > 0 ? `Reviewed ${totalApplicants} total applications` : "No applications yet",
              shortlistedCount > 0 ? `Shortlisted ${shortlistedCount} candidates` : "No shortlist activity yet",
            ]);
          }

          return;
        }

        if (currentUser.role === "mentor") {
          const forumResponse = await listForumPosts({ page: 1, per_page: 50, sort: "recent" });
          const posts = forumResponse.posts ?? [];

          let answersCount = 0;
          const askerIds = new Set<number>();

          posts.forEach((post) => {
            (post.replies ?? []).forEach((reply) => {
              if (reply.user_id === currentUser.id) {
                answersCount += 1;
                if (typeof post.user_id === "number" && post.user_id > 0) {
                  askerIds.add(post.user_id);
                }
              }
            });
          });

          const openQuestions = posts.filter((post) => post.post_type === "question" && !post.is_solved).length;
          const recentMentorActivity = posts
            .flatMap((post) =>
              (post.replies ?? [])
                .filter((reply) => reply.user_id === currentUser.id)
                .map(() => `Answered: ${post.title}`)
            )
            .slice(0, 3);

          if (!cancelled) {
            setStats([
              { label: "Questions Answered", value: String(answersCount), icon: "bi-chat-quote" },
              { label: "Distinct Askers", value: String(askerIds.size), icon: "bi-people" },
              { label: "Open Questions", value: String(openQuestions), icon: "bi-patch-question" },
            ]);

            setRecentActivity(
              recentMentorActivity.length > 0
                ? recentMentorActivity
                : ["No mentor answer activity found yet", "Answer forum questions to build activity", "Live data is shown from forum replies"]
            );
          }

          return;
        }

        if (currentUser.role === "job_seeker") {
          const [applicationsResponse, jobsResponse] = await Promise.all([
            listMyApplications({ per_page: 50 }),
            listPublicJobs(),
          ]);

          const applications = applicationsResponse.applications ?? [];
          const savedJobsCount = loadSavedJobsCount();
          const scoredJobs = (jobsResponse.jobs ?? [])
            .map((job) => ({
              job,
              match: calculateJobMatch(job, currentUser.skills),
            }))
            .sort((left, right) => right.match.percentage - left.match.percentage);

          if (!cancelled) {
            setStats([
              { label: "Applications", value: String(applications.length), icon: "bi-send-check" },
              { label: "Saved Jobs", value: String(savedJobsCount), icon: "bi-bookmark-heart" },
              { label: "Recommended Jobs", value: String(scoredJobs.length), icon: "bi-stars" },
            ]);

            const latestApplications = applications
              .slice(0, 3)
              .map((item) => `${item.job?.title ?? `Job #${item.job_id}`}: ${formatJobStatus(item.status)}`);

            setRecentActivity(
              latestApplications.length > 0
                ? latestApplications
                : ["No applications submitted yet", "Browse jobs and apply to start tracking progress", "Saved jobs sync from your browser"]
            );
            setRecommendedJobs(scoredJobs.slice(0, 3).map((item) => item.job));
          }

          return;
        }

        const adminSummary = await getAdminSummary();
        if (!cancelled) {
          setStats([
            { label: "Users", value: String(adminSummary.summary.users), icon: "bi-people" },
            { label: "Jobs", value: String(adminSummary.summary.jobs), icon: "bi-briefcase" },
            { label: "Applications", value: String(adminSummary.summary.applications), icon: "bi-send-check" },
          ]);
          setRecentActivity([
            `Forum posts tracked: ${adminSummary.summary.forumPosts}`,
            "Open moderation and users panels for detailed admin actions",
            "Admin metrics are loaded from backend analytics endpoints",
          ]);
        }
      } catch {
        if (!cancelled) {
          setStats([]);
          setRecentActivity(["Could not load dashboard metrics right now."]);
          setRecommendedJobs([]);
          toastUI.error("Could not load dashboard metrics.");
        }
      } finally {
        if (!cancelled) {
          setMetricsLoading(false);
        }
      }
    }

    void loadRoleMetrics();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || !user || metricsLoading) {
    return <Loading label="Loading dashboard..." />;
  }

  const scoredRecommendedJobs =
    user.role === "job_seeker"
      ? recommendedJobs
          .map((job) => ({
            ...job,
            match: calculateJobMatch(job, user.skills),
          }))
          .sort((left, right) => right.match.percentage - left.match.percentage)
      : [];

  return (
    <div className="vstack gap-3">
      <Card
        title={roleTitle}
        subtitle="Overview of your account activity and key metrics."
        actions={<Badge variant="primary">{user.role.replace("_", " ")}</Badge>}
      >
        <div className="row g-3">
          {stats.map((stat) => (
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
                <div className="text-muted small">Matches based on your listed skills.</div>
              </div>
              <Link to="/dashboard/jobs" className="btn btn-outline-primary btn-sm">
                View all
              </Link>
            </div>
            <div className="row g-3">
              {scoredRecommendedJobs.map((job) => (
                <div key={job.id} className="col-12 col-lg-4">
                  <div className="p-3 border rounded-3 h-100">
                    <div className="d-flex justify-content-between gap-2 mb-2">
                      <div className="fw-semibold">{job.title}</div>
                      <MatchBadge percentage={job.match.percentage} />
                    </div>
                    <div className="text-muted small mb-2">
                      {job.location} | {job.employment_type.replace("_", " ")}
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
