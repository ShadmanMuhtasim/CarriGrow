import RoleDashboardLayout from "./RoleDashboardLayout";

type Props = {
  onLogout: () => void;
};

export default function JobSeekerLayout({ onLogout }: Props) {
  return (
    <RoleDashboardLayout
      subtitle="Job Seeker"
      heading="Job Seeker Dashboard"
      onLogout={onLogout}
      links={[
        { to: "/dashboard", label: "Overview", icon: "bi-speedometer2", end: true },
        { to: "/dashboard/jobs", label: "Jobs", icon: "bi-briefcase" },
        { to: "/dashboard/my-applications", label: "Applications", icon: "bi-send-check" },
        { to: "/dashboard/mentorship", label: "Mentorship", icon: "bi-people" },
        { to: "/dashboard/profile", label: "Profile", icon: "bi-person-badge" },
      ]}
    />
  );
}

