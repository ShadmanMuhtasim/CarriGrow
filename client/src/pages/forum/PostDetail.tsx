import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import ReplyThread from "../../components/forum/ReplyThread";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { createForumReply, getForumPost, markReplyAsSolution, reportForumPost, reportForumReply, voteForumPost } from "../../services/forum";
import type { ForumPost } from "../../types/models";

type VoteValue = "up" | "down" | null;

function formatDate(value?: string | null): string {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

export default function PostDetail() {
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const forumBasePath = location.pathname.startsWith("/dashboard") ? "/dashboard/forum-posts" : "/forum";

  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [voteValue, setVoteValue] = useState<VoteValue>(null);

  const postId = useMemo(() => {
    const parsed = Number(params.postId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.postId]);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }
    const currentPostId = postId;

    let cancelled = false;

    async function loadPost() {
      setLoading(true);
      try {
        const response = await getForumPost(currentPostId);
        if (!cancelled) {
          setPost(response.post);
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          toastUI.error("Could not load this forum post.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const canMarkSolution = Boolean(user && post && (user.role === "mentor" || user.id === post.user_id));

  async function handleSubmitReply(content: string) {
    if (!post) {
      return;
    }

    if (!user) {
      toastUI.error("Sign in to reply.");
      return;
    }

    setReplySubmitting(true);
    try {
      const response = await createForumReply(post.id, { content: `<p>${content}</p>` });
      setPost((current) => {
        if (!current) {
          return current;
        }

        const replies = [...(current.replies ?? []), response.reply];
        return {
          ...current,
          replies,
          replies_count: replies.length,
        };
      });
      toastUI.success("Reply posted.");
    } catch {
      toastUI.error("Could not post your reply.");
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleMarkSolution(replyId: number) {
    if (!post) {
      return;
    }

    try {
      await markReplyAsSolution(replyId);
      setPost((current) => {
        if (!current) {
          return current;
        }

        const replies = (current.replies ?? []).map((reply) => ({
          ...reply,
          is_solution: reply.id === replyId,
        }));

        return {
          ...current,
          replies,
          is_solved: true,
        };
      });
      toastUI.success("Reply marked as solution.");
    } catch {
      toastUI.error("Could not mark this reply as solution.");
    }
  }

  async function handleVote(direction: Exclude<VoteValue, null>) {
    if (!post) {
      return;
    }

    if (!user) {
      toastUI.info("Sign in to vote.");
      return;
    }

    const nextVote = voteValue === direction ? null : direction;

    try {
      await voteForumPost(post.id, direction);

      const delta =
        (nextVote === "up" ? 1 : nextVote === "down" ? -1 : 0) -
        (voteValue === "up" ? 1 : voteValue === "down" ? -1 : 0);

      setVoteValue(nextVote);
      setPost((current) =>
        current
          ? {
              ...current,
              likes_count: Math.max(0, (current.likes_count ?? 0) + delta),
            }
          : current
      );
    } catch {
      toastUI.error("Could not register your vote.");
    }
  }

  async function handleReportPost() {
    if (!post || !user) {
      toastUI.info("Sign in to report content.");
      return;
    }

    const reason = window.prompt("Why are you reporting this post?", "Spam or abusive content");
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await reportForumPost(post.id, { reason: reason.trim() });
      toastUI.success("Report submitted. Admin will review it.");
    } catch {
      toastUI.error("Could not submit post report.");
    }
  }

  async function handleReportReply(replyId: number) {
    if (!user) {
      toastUI.info("Sign in to report content.");
      return;
    }

    const reason = window.prompt("Why are you reporting this reply?", "Spam or abusive content");
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      await reportForumReply(replyId, { reason: reason.trim() });
      toastUI.success("Report submitted. Admin will review it.");
    } catch {
      toastUI.error("Could not submit reply report.");
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <Loading label="Loading forum post..." />
      </div>
    );
  }

  if (!postId || !post) {
    return (
      <div className="container py-4">
        <Card title="Post not found" subtitle="The selected forum post is unavailable.">
          <Link to={forumBasePath} className="btn btn-outline-primary">
            Back to forum
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Forum", to: "/forum" }, { label: "Post Detail" }]} />

        <Card
          title={post.title}
          subtitle={`By ${post.author_name ?? "Community Member"} - ${formatDate(post.created_at)}`}
          actions={
            <div className="d-flex align-items-center gap-2">
              {post.is_solved ? <span className="badge text-bg-success">Solved</span> : null}
              {user?.role === "mentor" ? (
                <Link to="/dashboard/forum-overview">
                  <Button type="button" variant="outline">
                    Back to Mentor Dashboard
                  </Button>
                </Link>
              ) : null}
              <Link to={`${forumBasePath}/new`}>
                <Button type="button" variant="outline" icon={<i className="bi bi-plus-lg" />}>
                  New post
                </Button>
              </Link>
            </div>
          }
        >
          <div className="d-flex flex-wrap gap-2 mb-3">
            {(post.skills ?? []).map((skill) => (
              <span key={`${post.id}-${skill.id}`} className="badge rounded-pill text-bg-light border">
                {skill.name}
              </span>
            ))}
          </div>

          <div className="mb-3 text-muted" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border rounded-3 p-3 mb-3">
            <div className="small text-muted d-flex gap-3">
              <span><i className="bi bi-eye me-1" />{post.views_count ?? 0} views</span>
              <span><i className="bi bi-chat-left-text me-1" />{post.replies_count ?? 0} replies</span>
              <span><i className="bi bi-hand-thumbs-up me-1" />{post.likes_count ?? 0} likes</span>
            </div>

            <div className="d-flex gap-2">
              <Button
                type="button"
                variant={voteValue === "up" ? "primary" : "outline"}
                className="btn-sm"
                onClick={() => void handleVote("up")}
              >
                <i className="bi bi-hand-thumbs-up me-1" />Upvote
              </Button>
              <Button
                type="button"
                variant={voteValue === "down" ? "danger" : "outline"}
                className="btn-sm"
                onClick={() => void handleVote("down")}
              >
                <i className="bi bi-hand-thumbs-down me-1" />Downvote
              </Button>
              {user ? (
                <Button type="button" variant="outline" className="btn-sm" onClick={() => void handleReportPost()}>
                  <i className="bi bi-flag me-1" />Report
                </Button>
              ) : null}
            </div>
          </div>

          <ReplyThread
            replies={post.replies ?? []}
            canReply={Boolean(user)}
            canMarkSolution={canMarkSolution}
            canReport={Boolean(user)}
            submitting={replySubmitting}
            onSubmitReply={handleSubmitReply}
            onMarkSolution={handleMarkSolution}
            onReportReply={handleReportReply}
          />
        </Card>
      </div>
    </div>
  );
}
