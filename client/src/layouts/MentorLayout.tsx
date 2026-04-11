import RoleDashboardLayout from "./RoleDashboardLayout";

type Props = {
  onLogout: () => void;
};

export default function MentorLayout({ onLogout }: Props) {
  return (
    <RoleDashboardLayout
      subtitle="Mentor"
      heading="Mentor Dashboard"
      onLogout={onLogout}
      links={[
        { to: "/dashboard", label: "Overview", icon: "bi-speedometer2", end: true },
        { to: "/dashboard/forum-overview", label: "Forum Management", icon: "bi-grid-1x2" },
        { to: "/dashboard/questions-for-me", label: "Questions For Me", icon: "bi-patch-question" },
        { to: "/dashboard/my-answers", label: "My Answers", icon: "bi-chat-square-quote" },
        { to: "/dashboard/forum-posts", label: "All Forum Posts", icon: "bi-chat-left-text" },
        { to: "/dashboard/forum-posts/new", label: "New Post", icon: "bi-plus-square" },
        { to: "/mentors/me", label: "Public Profile", icon: "bi-box-arrow-up-right" },
        { to: "/dashboard/profile", label: "Edit Profile", icon: "bi-person-workspace" },
      ]}
    />
  );
}

