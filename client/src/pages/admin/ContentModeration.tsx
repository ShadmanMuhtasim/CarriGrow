import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { listModerationItems, resolveModerationItem, type ModerationItem, type ModerationStatus } from "../../services/admin";

function badgeClass(status: ModerationStatus) {
  if (status === "approved") {
    return "text-bg-success";
  }

  if (status === "removed") {
    return "text-bg-danger";
  }

  return "text-bg-warning";
}

export default function ContentModeration() {
  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | "all">("pending");
  const [items, setItems] = useState<ModerationItem[]>([]);

  const stats = useMemo(
    () => ({
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      removed: items.filter((item) => item.status === "removed").length,
    }),
    [items]
  );

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadQueue() {
      setLoading(true);

      try {
        const response = await listModerationItems(statusFilter);
        if (!cancelled) {
          setItems(response.items);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          toastUI.error("Could not load moderation queue.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadQueue();

    return () => {
      cancelled = true;
    };
  }, [statusFilter, user]);

  async function handleResolve(item: ModerationItem, action: "approve" | "remove") {
    try {
      const response = await resolveModerationItem(item.id, action);
      setItems((current) => current.map((entry) => (entry.id === item.id ? response.item : entry)));
      toastUI.success(`Item ${action === "approve" ? "approved" : "removed"}.`);
    } catch {
      toastUI.error("Could not update moderation status.");
    }
  }

  if (isLoading || loading) {
    return <Loading label="Loading moderation queue..." />;
  }

  if (!user || user.role !== "admin") {
    return (
      <Card title="Admin Access Required" subtitle="This section is available to admin accounts only.">
        <Link to="/dashboard" className="btn btn-outline-primary">
          Back to dashboard
        </Link>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Content Moderation" }]} />

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <Card title="Pending"><div className="display-6 mb-0">{stats.pending}</div></Card>
        </div>
        <div className="col-12 col-md-4">
          <Card title="Approved"><div className="display-6 mb-0">{stats.approved}</div></Card>
        </div>
        <div className="col-12 col-md-4">
          <Card title="Removed"><div className="display-6 mb-0">{stats.removed}</div></Card>
        </div>
      </div>

      <Card title="Moderation Queue" subtitle="Review reports and decide whether content should remain or be removed.">
        <div className="d-flex justify-content-end mb-3">
          <select className="form-select" style={{ maxWidth: 220 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ModerationStatus | "all")}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>
        </div>

        {items.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted">No moderation items for the selected filter.</div>
        ) : (
          <div className="vstack gap-3">
            {items.map((item) => (
              <article key={item.id} className="border rounded-3 p-3">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                  <div>
                    <div className="fw-semibold text-capitalize">{item.content_type.replace("_", " ")} #{item.content_id}</div>
                    <div className="text-muted small">Reported by {item.reported_by} • {new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`badge ${badgeClass(item.status)}`}>{item.status}</span>
                </div>

                <div className="mb-2">
                  <span className="text-muted small">Reason: </span>
                  <span className="fw-semibold">{item.reason}</span>
                </div>

                <p className="mb-3 text-muted">{item.excerpt}</p>

                <div className="d-flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" className="btn-sm" onClick={() => void handleResolve(item, "approve")} disabled={item.status !== "pending"}>
                    Keep content
                  </Button>
                  <Button type="button" variant="danger" className="btn-sm" onClick={() => void handleResolve(item, "remove")} disabled={item.status !== "pending"}>
                    Remove content
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
