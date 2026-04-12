import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import ExpertiseBadge from "../../components/mentor/ExpertiseBadge";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { getForumPost, listForumPosts } from "../../services/forum";
import type { ForumPost, ForumReply } from "../../types/models";

type MentorAnswerRecord = {
  post: ForumPost;
  reply: ForumReply;
};

type SolutionFilter = "all" | "solution" | "regular";

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

function sortAnswers(records: MentorAnswerRecord[]): MentorAnswerRecord[] {
  return [...records].sort((left, right) => toTimestamp(right.reply.created_at) - toTimestamp(left.reply.created_at));
}

export default function MyAnswers() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<MentorAnswerRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SolutionFilter>("all");

  useEffect(() => {
    if (!user || user.role !== "mentor") {
      setLoading(false);
      return;
    }

    const mentorUserId = user.id;
    let cancelled = false;

    async function loadAnswers() {
      setLoading(true);
      setLoadError(null);

      try {
        const postsResponse = await listForumPosts({
          sort: "recent",
          page: 1,
          per_page: 50,
        });

        if (cancelled) {
          return;
        }

        const candidates = postsResponse.posts.filter((post) => (post.replies_count ?? 0) > 0).slice(0, 25);

        const detailedPosts = await Promise.all(
          candidates.map(async (post) => {
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

        const myAnswers: MentorAnswerRecord[] = [];

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

        setAnswers(sortAnswers(myAnswers));
      } catch {
        if (!cancelled) {
          setAnswers([]);
          setLoadError("Could not load your answers right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAnswers();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredAnswers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return answers.filter((entry) => {
      if (filter === "solution" && !entry.reply.is_solution) {
        return false;
      }

      if (filter === "regular" && entry.reply.is_solution) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${entry.post.title} ${stripHtml(entry.reply.content)}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [answers, filter, search]);

  if (!user || user.role !== "mentor") {
    return (
      <Card title="My Answers" subtitle="Mentor access required">
        <p className="text-muted mb-0">This page is available for mentor accounts only.</p>
      </Card>
    );
  }

  if (loading) {
    return <Loading label="Loading your answers..." />;
  }

  const solutionCount = answers.filter((entry) => entry.reply.is_solution).length;
  const voteCount = answers.reduce((sum, entry) => sum + (entry.reply.votes_count ?? 0), 0);

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "My Answers" }]} />

      <Card
        title="My Answers"
        subtitle="Track your latest replies, solution marks, and answer engagement."
        actions={
          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-light border">{answers.length} answers</span>
            <span className="badge text-bg-success">{solutionCount} solutions</span>
            <span className="badge text-bg-primary">{voteCount} votes</span>
          </div>
        }
      >
        <div className="row g-2">
          <div className="col-12 col-md-7">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by post title or answer text"
              aria-label="Search answers"
            />
          </div>
          <div className="col-12 col-md-5">
            <select
              className="form-select"
              value={filter}
              onChange={(event) => setFilter(event.target.value as SolutionFilter)}
              aria-label="Filter answers by solution state"
            >
              <option value="all">All answers</option>
              <option value="solution">Solutions only</option>
              <option value="regular">Regular answers</option>
            </select>
          </div>
        </div>
      </Card>

      {loadError ? <div className="alert alert-warning mb-0">{loadError}</div> : null}

      {filteredAnswers.length === 0 ? (
        <Card title="No matching answers">
          <p className="text-muted mb-3">
            {answers.length === 0
              ? "You have not answered any forum threads yet."
              : "No answers matched the current search/filter combination."}
          </p>
          <Link to="/dashboard/questions-for-me" className="btn btn-outline-primary btn-sm">
            Find questions to answer
          </Link>
        </Card>
      ) : (
        <div className="vstack gap-3">
          {filteredAnswers.map((entry) => (
            <Card key={entry.reply.id}>
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div>
                  <h3 className="h6 mb-1">{entry.post.title}</h3>
                  <div className="small text-muted">{formatDateTime(entry.reply.created_at)}</div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {entry.reply.is_solution ? <span className="badge text-bg-success">Marked solution</span> : null}
                  <span className="badge text-bg-light border">
                    <i className="bi bi-hand-thumbs-up me-1" />
                    {entry.reply.votes_count ?? 0}
                  </span>
                </div>
              </div>

              {(entry.post.skills ?? []).length > 0 ? (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {(entry.post.skills ?? []).map((skill) => (
                    <ExpertiseBadge key={`${entry.reply.id}-${skill.id}`} skill={skill} />
                  ))}
                </div>
              ) : null}

              <p className="small text-muted mt-3 mb-0">{stripHtml(entry.reply.content).slice(0, 220) || "No preview available."}</p>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <Link to={`/dashboard/forum-posts/${entry.post.id}`} className="btn btn-sm btn-outline-primary">
                  Open thread
                </Link>
                <Link to={`/mentors/${user.id}`} className="btn btn-sm btn-outline-secondary">
                  View public profile
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
