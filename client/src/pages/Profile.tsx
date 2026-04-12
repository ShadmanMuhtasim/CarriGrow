import Breadcrumbs from "../components/Breadcrumbs";
import Card from "../components/ui/Card";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import EmployerProfile from "./profile/EmployerProfile";
import JobSeekerProfile from "./profile/JobSeekerProfile";
import MentorProfile from "./profile/MentorProfile";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <Loading label="Loading profile..." />;
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Profile" }]} />

      {user.role === "job_seeker" ? <JobSeekerProfile /> : null}
      {user.role === "employer" ? <EmployerProfile /> : null}
      {user.role === "mentor" ? <MentorProfile /> : null}
      {user.role === "admin" ? (
        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <Card title="Admin Profile" subtitle="Manage your admin account and platform access details.">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-muted small">Name</div>
                  <div className="fw-semibold">{user.name}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="text-muted small">Email</div>
                  <div className="fw-semibold">{user.email}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="text-muted small">Role</div>
                  <div className="fw-semibold text-capitalize">{user.role.replace("_", " ")}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="text-muted small">Status</div>
                  <div className="fw-semibold">{user.status}</div>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-12 col-lg-5">
            <Card title="Admin Shortcuts" subtitle="Open the main admin operations quickly.">
              <div className="d-flex flex-wrap gap-2">
                <Link to="/dashboard/admin" className="btn btn-outline-primary btn-sm">Overview</Link>
                <Link to="/dashboard/users" className="btn btn-outline-primary btn-sm">Users</Link>
                <Link to="/dashboard/moderation" className="btn btn-outline-primary btn-sm">Moderation</Link>
                <Link to="/dashboard/system-logs" className="btn btn-outline-primary btn-sm">System Logs</Link>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
