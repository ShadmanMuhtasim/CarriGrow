import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import ExpertiseBadge from "../../components/mentor/ExpertiseBadge";
import Card from "../../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { getForumPost, listForumPosts } from "../../services/forum";
import { getUserSkills } from "../../services/user";
import type { ForumPost, ForumReply, Skill } from "../../types/models";

type MentorAnswer = {
  post: ForumPost;
  reply: ForumReply;
};

type MentorContribution = {
  id: string;
  type: "post" | "answer";
  title: string;
  excerpt: string;
  postId: number;
  isSolution?: boolean;
  createdAt?: string | null;
};

type MentorProfileViewModel = {
  id: number;
  name: string;
  headline: string | null;
  bio: string | null;
  mentorshipAreas: string[];
  availability: string[];
  expertiseSkills: Skill[];
  questionsAsked: number;
  answersGiven: number;
  solutionsGiven: number;
  answerVotes: number;
  contributions: MentorContribution[];
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

function uniqueSkills(skills: Skill[]): Skill[] {
  const byId = new Map<number, Skill>();

  for (const skill of skills) {
    byId.set(skill.id, skill);
  }

  return Array.from(byId.values());
}

function parseMentorId(rawMentorId: string | undefined, currentUserId?: number): number | null {
  if (!rawMentorId) {
    return null;
  }

  if (rawMentorId === "me") {
    return typeof currentUserId === "number" ? currentUserId : null;
  }

  const parsed = Number(rawMentorId);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildContributions(posts: ForumPost[], answers: MentorAnswer[]): MentorContribution[] {
  const fromPosts: MentorContribution[] = posts.map((post) => ({
    id: `post-${post.id}`,
    type: "post",
    title: post.title,
    excerpt: stripHtml(post.content).slice(0, 180),
    postId: post.id,
    createdAt: post.created_at,
  }));

  const fromAnswers: MentorContribution[] = answers.map((entry) => ({
    id: `answer-${entry.reply.id}`,
    type: "answer",
    title: entry.post.title,
    excerpt: stripHtml(entry.reply.content).slice(0, 180),
    postId: entry.post.id,
    isSolution: Boolean(entry.reply.is_solution),
    createdAt: entry.reply.created_at,
  }));

  return [...fromAnswers, ...fromPosts]
    .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
    .slice(0, 8);
}

export default function PublicMentorProfile() {
  const params = useParams();
  const { user } = useAuth();

  const resolvedMentorId = useMemo(() => parseMentorId(params.mentorId, user?.id), [params.mentorId, user?.id]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MentorProfileViewModel | null>(null);

  useEffect(() => {
    if (!resolvedMentorId) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const mentorId = resolvedMentorId;
    let cancelled = false;

    async function loadMentorProfile() {
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

        const authoredPosts = postsResponse.posts.filter((post) => post.user_id === mentorId);
        const candidatesForReplies = postsResponse.posts.filter((post) => (post.replies_count ?? 0) > 0).slice(0, 30);

        const detailedPosts = await Promise.all(
          candidatesForReplies.map(async (post) => {
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

        const mentorAnswers: MentorAnswer[] = [];

        for (const post of detailedPosts) {
          if (!post) {
            continue;
          }

          for (const reply of post.replies ?? []) {
            if (reply.user_id === mentorId) {
              mentorAnswers.push({ post, reply });
            }
          }
        }

        let explicitSkills: Skill[] = [];
        if (user) {
          try {
            const response = await getUserSkills(mentorId);
            explicitSkills = response.skills ?? [];
          } catch {
            explicitSkills = [];
          }
        }

        if (cancelled) {
          return;
        }

        const skillCandidates: Skill[] = [
          ...explicitSkills,
          ...authoredPosts.flatMap((post) => post.skills ?? []),
          ...mentorAnswers.flatMap((answer) => answer.post.skills ?? []),
        ];

        const expertiseSkills = uniqueSkills(skillCandidates);

        const ownProfile = user?.id === mentorId ? user.mentor_profile ?? user.mentorProfile ?? null : null;
        const derivedName =
          (user?.id === mentorId ? user.name : null) ??
          authoredPosts[0]?.author_name ??
          mentorAnswers[0]?.reply.author_name ??
          `Mentor #${mentorId}`;

        const contributions = buildContributions(authoredPosts, mentorAnswers);

        if (authoredPosts.length === 0 && mentorAnswers.length === 0 && !ownProfile) {
          setProfile(null);
          return;
        }

        const solutionsGiven = mentorAnswers.filter((entry) => entry.reply.is_solution).length;
        const answerVotes = mentorAnswers.reduce((sum, entry) => sum + (entry.reply.votes_count ?? 0), 0);

        setProfile({
          id: mentorId,
          name: derivedName,
          headline:
            ownProfile?.current_position && ownProfile.company
              ? `${ownProfile.current_position} at ${ownProfile.company}`
              : ownProfile?.current_position ?? null,
          bio: ownProfile?.bio ?? null,
          mentorshipAreas: ownProfile?.mentorship_areas ?? [],
          availability: ownProfile?.availability ?? [],
          expertiseSkills,
          questionsAsked: authoredPosts.filter((post) => post.post_type === "question").length,
          answersGiven: mentorAnswers.length,
          solutionsGiven,
          answerVotes,
          contributions,
        });
      } catch {
        if (!cancelled) {
          setProfile(null);
          setLoadError("Could not load this mentor profile right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMentorProfile();

    return () => {
      cancelled = true;
    };
  }, [resolvedMentorId, user]);

  if (loading) {
    return (
      <div className="container py-4">
        <Loading label="Loading mentor profile..." />
      </div>
    );
  }

  if (!resolvedMentorId) {
    return (
      <div className="container py-4">
        <Card title="Mentor profile unavailable">
          <p className="text-muted mb-3">
            {params.mentorId === "me"
              ? "Sign in to open your public mentor profile preview."
              : "The requested mentor id is invalid."}
          </p>
          <Link to="/forum" className="btn btn-outline-primary btn-sm">
            Back to forum
          </Link>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-4">
        <Card title="Mentor profile unavailable">
          <p className="text-muted mb-3">
            This mentor has no public forum activity yet, or the profile could not be found.
          </p>
          <Link to="/forum" className="btn btn-outline-primary btn-sm">
            Back to forum
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Mentor Profile" }, { label: profile.name }]} />

        <Card
          title={profile.name}
          subtitle="Public mentor profile view for forum credibility and discovery."
          actions={
            <div className="d-flex flex-wrap gap-2">
              <span className="badge text-bg-light border">Mentor ID: {profile.id}</span>
              <Link to="/forum" className="btn btn-sm btn-outline-primary">
                Browse forum
              </Link>
            </div>
          }
        >
          {profile.headline ? <p className="mb-2">{profile.headline}</p> : null}
          {profile.bio ? <p className="text-muted mb-0">{profile.bio}</p> : <p className="text-muted mb-0">No mentor bio shared yet.</p>}
        </Card>

        {loadError ? <div className="alert alert-warning mb-0">{loadError}</div> : null}

        <div className="row g-3">
          <div className="col-6 col-lg-3">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <div className="small text-muted">Answers given</div>
              <div className="h4 mb-0">{profile.answersGiven}</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <div className="small text-muted">Solutions marked</div>
              <div className="h4 mb-0">{profile.solutionsGiven}</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <div className="small text-muted">Questions asked</div>
              <div className="h4 mb-0">{profile.questionsAsked}</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="border rounded-3 p-3 h-100 bg-white">
              <div className="small text-muted">Answer votes</div>
              <div className="h4 mb-0">{profile.answerVotes}</div>
            </div>
          </div>
        </div>

        <Card title="Expertise Areas">
          {profile.expertiseSkills.length === 0 ? (
            <p className="text-muted mb-0">No public expertise tags yet.</p>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {profile.expertiseSkills.map((skill) => (
                <ExpertiseBadge key={skill.id} skill={skill} showLevel />
              ))}
            </div>
          )}
        </Card>

        {(profile.mentorshipAreas.length > 0 || profile.availability.length > 0) ? (
          <Card title="Mentorship Info">
            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="fw-semibold mb-2">Mentorship Areas</div>
                  {profile.mentorshipAreas.length === 0 ? (
                    <div className="text-muted small">No mentorship areas listed.</div>
                  ) : (
                    <ul className="mb-0 ps-3">
                      {profile.mentorshipAreas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="fw-semibold mb-2">Availability</div>
                  {profile.availability.length === 0 ? (
                    <div className="text-muted small">No availability shared.</div>
                  ) : (
                    <ul className="mb-0 ps-3">
                      {profile.availability.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        <Card title="Recent Forum Contributions">
          {profile.contributions.length === 0 ? (
            <p className="text-muted mb-0">No recent contributions yet.</p>
          ) : (
            <div className="vstack gap-3">
              {profile.contributions.map((item) => (
                <article key={item.id} className="border rounded-3 p-3">
                  <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                    <div>
                      <div className="fw-semibold">{item.title}</div>
                      <div className="small text-muted">{formatDateTime(item.createdAt)}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <span className={`badge ${item.type === "answer" ? "text-bg-primary" : "text-bg-light border"}`}>
                        {item.type === "answer" ? "Answer" : "Post"}
                      </span>
                      {item.isSolution ? <span className="badge text-bg-success">Solution</span> : null}
                    </div>
                  </div>
                  <p className="small text-muted mt-2 mb-0">{item.excerpt || "No preview available."}</p>
                  <div className="mt-3">
                    <Link to={`/forum/${item.postId}`} className="btn btn-sm btn-outline-primary">
                      Open thread
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
