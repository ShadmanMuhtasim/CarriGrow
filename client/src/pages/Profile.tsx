import Breadcrumbs from "../components/Breadcrumbs";
import Card from "../components/ui/Card";
import Loading from "../components/Loading";
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
        <Card title="Admin Profile" subtitle="Admin profile editing is intentionally minimal in Milestone 1.">
          <p className="mb-0 text-muted">Use the dashboard controls to manage platform-level actions.</p>
        </Card>
      ) : null}
    </div>
  );
}
