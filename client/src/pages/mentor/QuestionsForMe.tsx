import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import ExpertiseBadge from "../../components/mentor/ExpertiseBadge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../hooks/useAuth";
import { listForumPosts } from "../../services/forum";
import type { ForumPost, Skill } from "../../types/models";

type SkillFilter = "all" | number;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toTimestamp(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function overlapsExpertise(post: ForumPost, mentorSkillIds: number[]): boolean {
  const postSkillIds = post.skill_ids ?? [];
  return postSkillIds.some((id) => mentorSkillIds.includes(id));
}

function onlyMatchingSkills(post: ForumPost, mentorSkillIds: number[]): Skill[] {
  return (post.skills ?? []).filter((skill) => mentorSkillIds.includes(skill.id));
}

function sortPostsByRecent(posts: ForumPost[]): ForumPost[] {
  return [...posts].sort((left, right) => toTimestamp(right.created_at) - toTimestamp(left.created_at));
}

export default function QuestionsForMe() {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();

  const mentorSkills = useMemo(() => user?.skills ?? [], [user]);
  const mentorSkillIds = useMemo(() => mentorSkills.map((skill) => skill.id), [mentorSkills]);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ForumPost[]>([]);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [markingNotifications, setMarkingNotifications] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const expertiseNotifications = useMemo(
    () =>
      [...notifications]
        .filter((notification) => notification.type === "forum_question_in_expertise")
        .sort((left, right) => toTimestamp(right.created_at) - toTimestamp(left.created_at)),
    [notifications]
  );

  const unreadExpertiseNotifications = useMemo(
    () => expertiseNotifications.filter((notification) => !notification.is_read),
    [expertiseNotifications]
  );

  useEffect(() => {
    if (!user || user.role !== "mentor") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadQuestions() {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await listForumPosts({
          type: "question",
          sort: "recent",
          page: 1,
          per_page: 50,
        });

        if (!cancelled) {
          const matched = response.posts.filter((post) => overlapsExpertise(post, mentorSkillIds));
          setQuestions(sortPostsByRecent(matched));
        }
      } catch {
        if (!cancelled) {
          setQuestions([]);
          setLoadError("Could not load questions in your expertise.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [mentorSkillIds, user]);

  async function markExpertiseAlertsRead() {
    const unreadIds = unreadExpertiseNotifications.map((notification) => notification.id);
    if (unreadIds.length === 0) {
      return;
    }

    setMarkingNotifications(true);
    try {
      await Promise.allSettled(unreadIds.map((notificationId) => markAsRead(notificationId)));
    } finally {
      setMarkingNotifications(false);
    }
  }

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return questions.filter((question) => {
      if (skillFilter !== "all" && !(question.skill_ids ?? []).includes(skillFilter)) {
        return false;
      }

      if (unansweredOnly && (question.replies_count ?? 0) > 0) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${question.title} ${stripHtml(question.content)}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [questions, search, skillFilter, unansweredOnly]);

  if (!user || user.role !== "mentor") {
    return (
      <Card title="Questions For Me" subtitle="Mentor access required">
        <p className="text-muted mb-0">This page is available for mentor accounts only.</p>
      </Card>
    );
  }

  if (loading) {
    return <Loading label="Loading questions for your expertise..." />;
  }

  const unansweredCount = questions.filter((question) => (question.replies_count ?? 0) === 0).length;

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Questions For Me" }]} />

      <Card
        title="Questions For Me"
        subtitle="Questions automatically matched to your mentor skill tags."
        actions={
          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-light border">{questions.length} matched</span>
            <span className="badge text-bg-warning">{unansweredCount} unanswered</span>
            <span className="badge text-bg-primary">{mentorSkills.length} skills</span>
          </div>
        }
      >
        {mentorSkills.length === 0 ? (
          <div className="alert alert-info mb-3">
            Add mentor skills in <Link to="/dashboard/profile">your profile</Link> to receive expertise-based question matching.
          </div>
        ) : null}

        {expertiseNotifications.length > 0 ? (
          <div className="alert alert-primary d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <div className="fw-semibold">New questions in your expertise</div>
              <div className="small">
                {unreadExpertiseNotifications.length} unread notification
                {unreadExpertiseNotifications.length === 1 ? "" : "s"} from the forum alert system.
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="btn-sm"
              loading={markingNotifications}
              disabled={unreadExpertiseNotifications.length === 0}
              onClick={() => void markExpertiseAlertsRead()}
            >
              Mark alerts read
            </Button>
          </div>
        ) : null}

        <div className="row g-2">
          <div className="col-12 col-lg-6">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search matched questions"
              aria-label="Search matched questions"
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <select
              className="form-select"
              value={skillFilter}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSkillFilter(nextValue === "all" ? "all" : Number(nextValue));
              }}
              aria-label="Filter questions by skill"
            >
              <option value="all">All my skills</option>
              {mentorSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="form-check form-switch border rounded-3 h-100 px-3 d-flex align-items-center">
              <input
                id="unanswered-only"
                className="form-check-input me-2"
                type="checkbox"
                checked={unansweredOnly}
                onChange={(event) => setUnansweredOnly(event.target.checked)}
              />
              <label className="form-check-label small" htmlFor="unanswered-only">
                Unanswered only
              </label>
            </div>
          </div>
        </div>
      </Card>

      {loadError ? <div className="alert alert-warning mb-0">{loadError}</div> : null}

      {filteredQuestions.length === 0 ? (
        <Card title="No matching questions">
          <p className="text-muted mb-0">No questions matched your current filters. Try removing a filter or checking again later.</p>
        </Card>
      ) : (
        <div className="vstack gap-3">
          {filteredQuestions.map((question) => {
            const relevantSkills = onlyMatchingSkills(question, mentorSkillIds);

            return (
              <Card key={question.id}>
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                  <div>
                    <h3 className="h6 mb-1">{question.title}</h3>
                    <div className="small text-muted">{formatDateTime(question.created_at)}</div>
                  </div>
                  {(question.replies_count ?? 0) === 0 ? <span className="badge text-bg-warning">Needs answer</span> : null}
                </div>

                {relevantSkills.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {relevantSkills.map((skill) => (
                      <ExpertiseBadge key={`${question.id}-${skill.id}`} skill={skill} showLevel />
                    ))}
                  </div>
                ) : null}

                <p className="small text-muted mt-3 mb-0">{stripHtml(question.content).slice(0, 220) || "No preview available."}</p>

                <div className="small text-muted mt-2 d-flex flex-wrap gap-3">
                  <span>
                    <i className="bi bi-chat-left-text me-1" />
                    {question.replies_count ?? 0} replies
                  </span>
                  <span>
                    <i className="bi bi-eye me-1" />
                    {question.views_count ?? 0} views
                  </span>
                </div>

                <div className="mt-3">
                  <Link to={`/dashboard/forum-posts/${question.id}`} className="btn btn-sm btn-outline-primary">
                    Answer now
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
