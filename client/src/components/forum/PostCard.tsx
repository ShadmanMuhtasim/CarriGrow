import { Link } from "react-router-dom";
import type { ForumPost } from "../../types/models";

type PostCardProps = {
  post: ForumPost;
  detailPath: string;
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatPostType(type: ForumPost["post_type"]): string {
  if (!type) {
    return "Discussion";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function PostCard({ post, detailPath }: PostCardProps) {
  const preview = stripHtml(post.content).slice(0, 160);

  return (
    <article className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="badge text-bg-light border">{formatPostType(post.post_type)}</span>
          {post.is_solved ? <span className="badge text-bg-success">Solved</span> : null}
          {post.is_pinned ? <span className="badge text-bg-warning">Pinned</span> : null}
        </div>

        <div>
          <h3 className="h6 mb-1">{post.title}</h3>
          <div className="text-muted small">By {post.author_name ?? "Community Member"}</div>
        </div>

        <p className="text-muted mb-0">{preview || "No preview available."}</p>

        <div className="d-flex flex-wrap gap-2">
          {(post.skills ?? []).map((skill) => (
            <span key={`${post.id}-${skill.id}`} className="badge rounded-pill text-bg-light border">
              {skill.name}
            </span>
          ))}
        </div>

        <div className="d-flex align-items-center justify-content-between mt-auto">
          <div className="text-muted small d-flex gap-3">
            <span><i className="bi bi-eye me-1" />{post.views_count ?? 0}</span>
            <span><i className="bi bi-chat-left-text me-1" />{post.replies_count ?? 0}</span>
            <span><i className="bi bi-hand-thumbs-up me-1" />{post.likes_count ?? 0}</span>
          </div>

          <Link to={detailPath} className="btn btn-sm btn-outline-primary">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
