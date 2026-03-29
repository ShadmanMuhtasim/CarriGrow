import RoleDashboardLayout from "./RoleDashboardLayout";

type Props = {
  onLogout: () => void;
};

export default function EmployerLayout({ onLogout }: Props) {
  return (
    <RoleDashboardLayout
      subtitle="Employer"
      heading="Employer Dashboard"
      onLogout={onLogout}
      links={[
        { to: "/dashboard", label: "Overview", icon: "bi-speedometer2", end: true },
        { to: "/dashboard/post-job", label: "Post Job", icon: "bi-file-earmark-plus" },
        { to: "/dashboard/manage-jobs", label: "Manage Jobs", icon: "bi-kanban" },
        { to: "/dashboard/applicants", label: "Applicants", icon: "bi-people" },
        { to: "/dashboard/profile", label: "Company Profile", icon: "bi-building" },
      ]}
    />
  );
}

