import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DashboardSection from "./pages/DashboardSection";
import NotFound from "./pages/NotFound";
import PostJob from "./pages/employer/PostJob";
import EditJob from "./pages/employer/EditJob";
import JobPostSuccess from "./pages/employer/JobPostSuccess";
import ManageJobs from "./pages/employer/ManageJobs";
import JobAnalytics from "./pages/employer/JobAnalytics";
import JobApplicants from "./pages/employer/JobApplicants";
import ApplicantsList from "./pages/employer/ApplicantsList";
import ApplicantDetail from "./pages/employer/ApplicantDetail";
import RecommendedJobs from "./pages/jobseeker/RecommendedJobs";
import JobsList from "./pages/jobs/JobsList";
import JobDetail from "./pages/jobs/JobDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
        </Route>

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="jobs" element={<RecommendedJobs />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="post-job/success" element={<JobPostSuccess />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="manage-jobs/:jobId/edit" element={<EditJob />} />
          <Route path="manage-jobs/:jobId/analytics" element={<JobAnalytics />} />
          <Route path="manage-jobs/:jobId/applicants" element={<JobApplicants />} />
          <Route path="manage-jobs/:jobId/applicants/list" element={<ApplicantsList />} />
          <Route path="manage-jobs/:jobId/applicants/:applicantId" element={<ApplicantDetail />} />
          <Route path=":section" element={<DashboardSection />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
