import { useState, type FormEvent } from "react";
import Button from "../ui/Button";
import type { ForumReply } from "../../types/models";

type ReplyThreadProps = {
  replies: ForumReply[];
  canReply: boolean;
  canMarkSolution: boolean;
  canReport: boolean;
  submitting: boolean;
  onSubmitReply: (content: string) => Promise<void>;
  onMarkSolution: (replyId: number) => Promise<void>;
  onReportReply: (replyId: number) => Promise<void>;
};

function formatDate(value?: string | null): string {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString();
}

export default function ReplyThread({
  replies,
  canReply,
  canMarkSolution,
  canReport,
  submitting,
  onSubmitReply,
  onMarkSolution,
  onReportReply,
}: ReplyThreadProps) {
  const [replyContent, setReplyContent] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalized = replyContent.trim();
    if (!normalized) {
      return;
    }

    await onSubmitReply(normalized);
    setReplyContent("");
  }

  return (
    <div className="vstack gap-3">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="h5 mb-0">Replies ({replies.length})</h2>
      </div>

      {replies.length === 0 ? <div className="border rounded-3 p-4 text-muted">No replies yet. Start the discussion.</div> : null}

      {replies.map((reply) => (
        <div key={reply.id} className={`border rounded-3 p-3 ${reply.is_solution ? "border-success bg-success-subtle" : ""}`}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <div>
              <div className="fw-semibold">{reply.author_name ?? "Community Member"}</div>
              <div className="small text-muted">{formatDate(reply.created_at)}</div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {reply.is_solution ? <span className="badge text-bg-success">Solution</span> : null}
              <span className="small text-muted">
                <i className="bi bi-hand-thumbs-up me-1" />
                {reply.votes_count ?? 0}
              </span>
              {canMarkSolution && !reply.is_solution ? (
                <Button type="button" variant="outline" className="btn-sm" onClick={() => void onMarkSolution(reply.id)}>
                  Mark solution
                </Button>
              ) : null}
              {canReport ? (
                <Button type="button" variant="outline" className="btn-sm" onClick={() => void onReportReply(reply.id)}>
                  Report
                </Button>
              ) : null}
            </div>
          </div>

          <div className="text-muted" dangerouslySetInnerHTML={{ __html: reply.content }} />
        </div>
      ))}

      <form className="border rounded-3 p-3" onSubmit={handleSubmit}>
        <label className="form-label">Add a reply</label>
        <textarea
          className="form-control"
          rows={4}
          placeholder={canReply ? "Share your answer or guidance..." : "Sign in to reply"}
          disabled={!canReply || submitting}
          value={replyContent}
          onChange={(event) => setReplyContent(event.target.value)}
        />

        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary" loading={submitting} disabled={!canReply || !replyContent.trim()}>
            Post reply
          </Button>
        </div>
      </form>
    </div>
  );
}
