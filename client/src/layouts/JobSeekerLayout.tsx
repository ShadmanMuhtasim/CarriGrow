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
        { to: "/dashboard/profile", label: "Profile", icon: "bi-person-badge" },
      ]}
    />
  );
}

