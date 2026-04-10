import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { listSystemLogs, type SystemLogEntry, type SystemLogLevel } from "../../services/admin";

function levelBadgeClass(level: SystemLogLevel) {
  if (level === "info") {
    return "text-bg-primary";
  }

  if (level === "warning") {
    return "text-bg-warning";
  }

  return "text-bg-danger";
}

export default function SystemLogs() {
  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<SystemLogLevel | "all">("all");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadLogs() {
      setLoading(true);

      try {
        const response = await listSystemLogs({
          search: search.trim() || undefined,
          level,
        });

        if (!cancelled) {
          setLogs(response.logs);
        }
      } catch {
        if (!cancelled) {
          setLogs([]);
          toastUI.error("Could not load system logs.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      cancelled = true;
    };
  }, [level, search, user]);

  if (isLoading || loading) {
    return <Loading label="Loading system logs..." />;
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
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "System Logs" }]} />

      <Card title="System Logs Viewer" subtitle="Track critical admin and platform events for diagnostics and audits.">
        <div className="row g-3 mb-3">
          <div className="col-12 col-lg-8">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search actor, action, or target"
              aria-label="Search logs"
            />
          </div>
          <div className="col-12 col-lg-4">
            <select className="form-select" value={level} onChange={(event) => setLevel(event.target.value as SystemLogLevel | "all")}>
              <option value="all">All levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted">No logs found for the selected filters.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${levelBadgeClass(log.level)}`}>{log.level}</span>
                    </td>
                    <td>{log.actor}</td>
                    <td>{log.action}</td>
                    <td>{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
