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
import ApplicantsOverview from "./pages/employer/ApplicantsOverview";
import JobAnalytics from "./pages/employer/JobAnalytics";
import JobApplicants from "./pages/employer/JobApplicants";
import ApplicantsList from "./pages/employer/ApplicantsList";
import ApplicantDetail from "./pages/employer/ApplicantDetail";
import RecommendedJobs from "./pages/jobseeker/RecommendedJobs";
import MyApplications from "./pages/jobseeker/MyApplications";
import SavedJobs from "./pages/jobseeker/SavedJobs";
import JobsList from "./pages/jobs/JobsList";
import JobDetail from "./pages/jobs/JobDetail";
import ApplyJob from "./pages/jobs/ApplyJob";
import ApplicationSuccess from "./components/applications/ApplicationSuccess";
import ForumList from "./pages/forum/ForumList";
import PostDetail from "./pages/forum/PostDetail";
import NewPost from "./pages/forum/NewPost";
import ForumOverview from "./pages/mentor/ForumOverview";
import MyAnswers from "./pages/mentor/MyAnswers";
import QuestionsForMe from "./pages/mentor/QuestionsForMe";
import PublicMentorProfile from "./pages/mentor/PublicMentorProfile";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import SystemLogs from "./pages/admin/SystemLogs";

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
          <Route path="/jobs/:jobId/apply" element={<ApplyJob />} />
          <Route path="/jobs/:jobId/apply/success" element={<ApplicationSuccess />} />
          <Route path="/forum" element={<ForumList />} />
          <Route path="/forum/new" element={<NewPost />} />
          <Route path="/forum/:postId" element={<PostDetail />} />
          <Route path="/mentors/:mentorId" element={<PublicMentorProfile />} />
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
          <Route path="my-applications" element={<MyApplications />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="post-job/success" element={<JobPostSuccess />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="applicants" element={<ApplicantsOverview />} />
          <Route path="manage-jobs/:jobId/edit" element={<EditJob />} />
          <Route path="manage-jobs/:jobId/analytics" element={<JobAnalytics />} />
          <Route path="manage-jobs/:jobId/applicants" element={<JobApplicants />} />
          <Route path="manage-jobs/:jobId/applicants/list" element={<ApplicantsList />} />
          <Route path="manage-jobs/:jobId/applicants/:applicantId" element={<ApplicantDetail />} />
          <Route path="forum-posts" element={<ForumList />} />
          <Route path="forum-posts/new" element={<NewPost />} />
          <Route path="forum-posts/:postId" element={<PostDetail />} />
          <Route path="forum-overview" element={<ForumOverview />} />
          <Route path="my-answers" element={<MyAnswers />} />
          <Route path="questions-for-me" element={<QuestionsForMe />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:userId" element={<UserManagement />} />
          <Route path="moderation" element={<ContentModeration />} />
          <Route path="system-logs" element={<SystemLogs />} />
          <Route path=":section" element={<DashboardSection />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
