import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { getMe } from "../services/user";
import { getToken, removeToken } from "../utils/token";
import JobSeekerLayout from "./JobSeekerLayout";
import EmployerLayout from "./EmployerLayout";
import MentorLayout from "./MentorLayout";
import AdminLayout from "./AdminLayout";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const onLogout = async () => {
    const token = getToken();
    try {
      if (token) await logout();
    } finally {
      removeToken();
      navigate("/login");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setRole(me?.user?.role ?? "job_seeker");
      } catch {
        removeToken();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return <div className="p-4 text-muted">Loading dashboard...</div>;
  }

  if (role === "employer") return <EmployerLayout onLogout={onLogout} />;
  if (role === "mentor") return <MentorLayout onLogout={onLogout} />;
  if (role === "admin") return <AdminLayout onLogout={onLogout} />;

  return <JobSeekerLayout onLogout={onLogout} />;
}
