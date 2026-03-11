import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Loading";
import JobSeekerLayout from "./JobSeekerLayout";
import EmployerLayout from "./EmployerLayout";
import MentorLayout from "./MentorLayout";
import AdminLayout from "./AdminLayout";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  const onLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  };

  if (isLoading || !user) {
    return <Loading label="Loading dashboard..." fullPage />;
  }

  if (user.role === "employer") return <EmployerLayout onLogout={onLogout} />;
  if (user.role === "mentor") return <MentorLayout onLogout={onLogout} />;
  if (user.role === "admin") return <AdminLayout onLogout={onLogout} />;

  return <JobSeekerLayout onLogout={onLogout} />;
}
