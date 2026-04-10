import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { getAdminGrowth, getAdminSummary, listAdminReports, type AdminReport, type GrowthPoint } from "../../services/admin";

function GrowthChart({ points }: { points: GrowthPoint[] }) {
  const maxValue = Math.max(1, ...points.map((point) => Math.max(point.users, point.jobs, point.applications)));

  return (
    <div className="border rounded-3 p-3">
      <div className="fw-semibold mb-2">Platform Growth</div>
      <div className="text-muted small mb-3">Monthly trend for users, jobs, and applications.</div>

      <div className="row g-2">
        {points.map((point) => (
          <div key={point.label} className="col-6 col-md-2">
            <div className="small text-muted text-center mb-1">{point.label}</div>
            <div className="d-flex align-items-end gap-1" style={{ minHeight: 140 }}>
              <div className="flex-fill bg-primary rounded-top" style={{ height: `${Math.max((point.users / maxValue) * 120, 6)}px` }} title={`Users: ${point.users}`} />
              <div className="flex-fill bg-success rounded-top" style={{ height: `${Math.max((point.jobs / maxValue) * 120, 6)}px` }} title={`Jobs: ${point.jobs}`} />
              <div className="flex-fill bg-warning rounded-top" style={{ height: `${Math.max((point.applications / maxValue) * 120, 6)}px` }} title={`Applications: ${point.applications}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-3 mt-3 small text-muted">
        <span><i className="bi bi-square-fill text-primary me-1" />Users</span>
        <span><i className="bi bi-square-fill text-success me-1" />Jobs</span>
        <span><i className="bi bi-square-fill text-warning me-1" />Applications</span>
      </div>
    </div>
  );
}

function reportBadgeClass(status: AdminReport["status"]) {
  return status === "ready" ? "text-bg-success" : "text-bg-warning";
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ users: 0, jobs: 0, applications: 0, forumPosts: 0 });
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);

  const stats = useMemo(
    () => [
      { label: "Users", value: summary.users, icon: "bi-people" },
      { label: "Jobs", value: summary.jobs, icon: "bi-briefcase" },
      { label: "Applications", value: summary.applications, icon: "bi-send-check" },
      { label: "Forum Posts", value: summary.forumPosts, icon: "bi-chat-left-text" },
    ],
    [summary]
  );

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAdminData() {
      setLoading(true);

      try {
        const [summaryResponse, growthResponse, reportsResponse] = await Promise.all([
          getAdminSummary(),
          getAdminGrowth(),
          listAdminReports(),
        ]);

        if (!cancelled) {
          setSummary(summaryResponse.summary);
          setGrowth(growthResponse.points);
          setReports(reportsResponse.reports);
        }
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load admin dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || loading) {
    return <Loading label="Loading admin dashboard..." />;
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
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Admin" }]} />

      <Card
        title="Admin Dashboard"
        subtitle="Issue #35 admin frontend: analytics, growth charts, moderation visibility, and report management."
        actions={
          <div className="d-flex gap-2">
            <Link to="/dashboard/users">
              <Button type="button" variant="outline">Manage users</Button>
            </Link>
            <Link to="/dashboard/moderation">
              <Button type="button" variant="outline">Moderation queue</Button>
            </Link>
          </div>
        }
      >
        <div className="row g-3 mb-3">
          {stats.map((item) => (
            <div key={item.label} className="col-12 col-md-6 col-xl-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="text-muted small mb-1">
                  <i className={`bi ${item.icon} me-2`} />
                  {item.label}
                </div>
                <div className="h4 mb-0">{item.value.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        <GrowthChart points={growth} />
      </Card>

      <Card
        title="Reports Management"
        subtitle="Generate and track platform reports for leadership and moderation audits."
        actions={<Button type="button" variant="primary" icon={<i className="bi bi-file-earmark-arrow-down" />}>Generate report</Button>}
      >
        {reports.length === 0 ? (
          <div className="text-muted">No reports available yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="fw-semibold">{report.title}</td>
                    <td>{report.type}</td>
                    <td>
                      <span className={`badge ${reportBadgeClass(report.status)}`}>{report.status}</span>
                    </td>
                    <td>{new Date(report.generated_at).toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button type="button" variant="outline" className="btn-sm">View</Button>
                        <Button type="button" variant="outline" className="btn-sm" disabled={report.status !== "ready"}>Export</Button>
                      </div>
                    </td>
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
