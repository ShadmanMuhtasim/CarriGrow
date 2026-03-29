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
        { to: "/dashboard/forum-posts", label: "Forum Posts", icon: "bi-chat-left-text" },
        { to: "/dashboard/questions", label: "Q&A", icon: "bi-question-circle" },
        { to: "/dashboard/mentees", label: "Mentees", icon: "bi-people" },
        { to: "/dashboard/profile", label: "Mentor Profile", icon: "bi-person-workspace" },
      ]}
    />
  );
}

