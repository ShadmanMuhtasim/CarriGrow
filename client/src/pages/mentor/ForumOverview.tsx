import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import ExpertiseBadge from "../../components/mentor/ExpertiseBadge";
import Card from "../../components/ui/Card";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../hooks/useAuth";
import { getForumPost, listForumPosts } from "../../services/forum";
import type { ForumPost, ForumReply, Skill, UserNotification } from "../../types/models";

type MentorAnswer = {
  post: ForumPost;
  reply: ForumReply;
};

type EngagementMetrics = {
  expertiseQuestionCount: number;
  unansweredCount: number;
  answerCount: number;
  solutionsCount: number;
  answerVotes: number;
  expertiseViews: number;
};

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

function hasSkillOverlap(post: ForumPost, mentorSkillIds: number[]): boolean {
  if (mentorSkillIds.length === 0) {
    return false;
  }

  const postSkillIds = post.skill_ids ?? [];
  return postSkillIds.some((id) => mentorSkillIds.includes(id));
}

function uniqueSkills(skills: Skill[]): Skill[] {
  const byId = new Map<number, Skill>();

  for (const skill of skills) {
    byId.set(skill.id, skill);
  }

  return Array.from(byId.values());
}

function sortNotifications(items: UserNotification[]): UserNotification[] {
  return [...items].sort((left, right) => toTimestamp(right.created_at) - toTimestamp(left.created_at));
}

function sortAnswers(items: MentorAnswer[]): MentorAnswer[] {
  return [...items].sort((left, right) => toTimestamp(right.reply.created_at) - toTimestamp(left.reply.created_at));
}

export default function ForumOverview() {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const mentorSkills = useMemo(() => user?.skills ?? [], [user]);
  const mentorSkillIds = useMemo(() => mentorSkills.map((skill) => skill.id), [mentorSkills]);

  const [loading, setLoading] = useState(true);
  const [recentQuestions, setRecentQuestions] = useState<ForumPost[]>([]);
  const [recentAnswers, setRecentAnswers] = useState<MentorAnswer[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    expertiseQuestionCount: 0,
    unansweredCount: 0,
    answerCount: 0,
    solutionsCount: 0,
    answerVotes: 0,
    expertiseViews: 0,
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  const expertiseNotifications = useMemo(
    () => sortNotifications(notifications.filter((notification) => notification.type === "forum_question_in_expertise")),
    [notifications]
  );

  useEffect(() => {
    if (!user || user.role !== "mentor") {
      setLoading(false);
      return;
    }

    const mentorUserId = user.id;
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setLoadError(null);

      try {
        const questionResponse = await listForumPosts({
          type: "question",
          sort: "recent",
          page: 1,
          per_page: 50,
        });

        if (cancelled) {
          return;
        }

        const questionsInExpertise = questionResponse.posts.filter((post) => hasSkillOverlap(post, mentorSkillIds));
        const unansweredCount = questionsInExpertise.filter((post) => (post.replies_count ?? 0) === 0).length;

        const postsWithReplies = questionResponse.posts.filter((post) => (post.replies_count ?? 0) > 0).slice(0, 20);

        const detailedPosts = await Promise.all(
          postsWithReplies.map(async (post) => {
            try {
              const response = await getForumPost(post.id);
              return response.post;
            } catch {
              return null;
            }
          })
        );

        if (cancelled) {
          return;
        }

        const myAnswers: MentorAnswer[] = [];

        for (const post of detailedPosts) {
          if (!post) {
            continue;
          }

          for (const reply of post.replies ?? []) {
            if (reply.user_id === mentorUserId) {
              myAnswers.push({ post, reply });
            }
          }
        }

        const sortedAnswers = sortAnswers(myAnswers);
        const expertiseViews = questionsInExpertise.reduce((sum, post) => sum + (post.views_count ?? 0), 0);
        const solutionsCount = sortedAnswers.filter((entry) => Boolean(entry.reply.is_solution)).length;
        const answerVotes = sortedAnswers.reduce((sum, entry) => sum + (entry.reply.votes_count ?? 0), 0);

        setRecentQuestions(questionsInExpertise.slice(0, 6));
        setRecentAnswers(sortedAnswers.slice(0, 6));
        setMetrics({
          expertiseQuestionCount: questionsInExpertise.length,
          unansweredCount,
          answerCount: sortedAnswers.length,
          solutionsCount,
          answerVotes,
          expertiseViews,
        });
      } catch {
        if (!cancelled) {
          setRecentQuestions([]);
          setRecentAnswers([]);
          setMetrics({
            expertiseQuestionCount: 0,
            unansweredCount: 0,
            answerCount: 0,
            solutionsCount: 0,
            answerVotes: 0,
            expertiseViews: 0,
          });
          setLoadError("Could not load mentor forum analytics right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [mentorSkillIds, user]);

  if (!user || user.role !== "mentor") {
    return (
      <Card title="Mentor Forum Overview" subtitle="Mentor access required">
        <p className="text-muted mb-0">This page is available for mentor accounts only.</p>
      </Card>
    );
  }

  if (loading) {
    return <Loading label="Loading mentor forum overview..." />;
  }

  const unreadExpertiseAlerts = expertiseNotifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Mentor Forum Overview" }]} />

      <Card
        title="Mentor Forum Overview"
        subtitle="Recent questions in your expertise, your answers, and forum engagement metrics."
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link to="/dashboard/questions-for-me" className="btn btn-sm btn-outline-primary">
              Questions for me
            </Link>
            <Link to="/dashboard/my-answers" className="btn btn-sm btn-outline-primary">
              My answers
            </Link>
            <Link to={`/mentors/${user.id}`} className="btn btn-sm btn-outline-primary">
              Public profile
            </Link>
          </div>
        }
      >
        <div className="row g-3">
          <div className="col-6 col-lg-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Questions in expertise</div>
              <div className="h4 mb-0">{metrics.expertiseQuestionCount}</div>
            </div>
          </div>
          <div className="col-6 col-lg-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Unanswered questions</div>
              <div className="h4 mb-0">{metrics.unansweredCount}</div>
            </div>
          </div>
          <div className="col-6 col-lg-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Your answers</div>
              <div className="h4 mb-0">{metrics.answerCount}</div>
            </div>
          </div>
          <div className="col-6 col-lg-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Solutions marked</div>
              <div className="h4 mb-0">{metrics.solutionsCount}</div>
            </div>
          </div>
          <div className="col-6 col-lg-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Answer votes</div>
              <div className="h4 mb-0">{metrics.answerVotes}</div>
            </div>
          </div>
          <div className="col-6 col-lg-4">
            <div className="border rounded-3 p-3 h-100">
              <div className="text-muted small">Expertise question views</div>
              <div className="h4 mb-0">{metrics.expertiseViews}</div>
            </div>
          </div>
        </div>

        {loadError ? <div className="alert alert-warning mt-3 mb-0">{loadError}</div> : null}
      </Card>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <Card title="Recent Questions In Your Expertise">
            {mentorSkills.length === 0 ? (
              <div className="alert alert-info mb-0">
                Add skill tags in <Link to="/dashboard/profile">your mentor profile</Link> to personalize this feed.
              </div>
            ) : recentQuestions.length === 0 ? (
              <div className="border rounded-3 p-3 text-muted">No matching questions yet.</div>
            ) : (
              <div className="vstack gap-3">
                {recentQuestions.map((question) => {
                  const matchingSkills = uniqueSkills(
                    (question.skills ?? []).filter((skill) => mentorSkillIds.includes(skill.id))
                  );

                  return (
                    <article key={question.id} className="border rounded-3 p-3">
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <div>
                          <h3 className="h6 mb-1">{question.title}</h3>
                          <div className="small text-muted">{formatDateTime(question.created_at)}</div>
                        </div>
                        {(question.replies_count ?? 0) === 0 ? <span className="badge text-bg-warning">Unanswered</span> : null}
                      </div>

                      {matchingSkills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {matchingSkills.map((skill) => (
                            <ExpertiseBadge key={`${question.id}-${skill.id}`} skill={skill} />
                          ))}
                        </div>
                      ) : null}

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
                          Open thread
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="col-12 col-xl-6">
          <Card title="Your Recent Answers">
            {recentAnswers.length === 0 ? (
              <div className="border rounded-3 p-3 text-muted">You have not posted any forum answers yet.</div>
            ) : (
              <div className="vstack gap-3">
                {recentAnswers.map((entry) => (
                  <article key={entry.reply.id} className="border rounded-3 p-3">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div>
                        <div className="fw-semibold">{entry.post.title}</div>
                        <div className="small text-muted">{formatDateTime(entry.reply.created_at)}</div>
                      </div>
                      {entry.reply.is_solution ? <span className="badge text-bg-success">Solution</span> : null}
                    </div>
                    <p className="small text-muted mt-2 mb-0">{stripHtml(entry.reply.content).slice(0, 160) || "No preview available."}</p>
                    <div className="small text-muted mt-2">
                      <i className="bi bi-hand-thumbs-up me-1" />
                      {entry.reply.votes_count ?? 0} votes
                    </div>
                    <div className="mt-3">
                      <Link to={`/dashboard/forum-posts/${entry.post.id}`} className="btn btn-sm btn-outline-primary">
                        View discussion
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card
        title="New Questions Notification"
        subtitle="Alerts from the notification system for new questions in your expertise."
        actions={<span className="badge text-bg-primary">{unreadExpertiseAlerts} unread</span>}
      >
        {expertiseNotifications.length === 0 ? (
          <div className="border rounded-3 p-3 text-muted">No expertise question alerts yet.</div>
        ) : (
          <div className="vstack gap-2">
            {expertiseNotifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className={`border rounded-3 p-3 ${notification.is_read ? "" : "bg-light"}`.trim()}>
                <div className="d-flex align-items-start justify-content-between gap-2">
                  <div>
                    <div className="fw-semibold">{notification.title}</div>
                    <div className="small text-muted">{notification.message}</div>
                  </div>
                  {!notification.is_read ? <span className="badge text-bg-primary">New</span> : null}
                </div>
                <div className="small text-muted mt-2">{formatDateTime(notification.created_at)}</div>
                {notification.post_id ? (
                  <div className="mt-2">
                    <Link to={`/dashboard/forum-posts/${notification.post_id}`} className="btn btn-sm btn-outline-primary">
                      Open question
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
