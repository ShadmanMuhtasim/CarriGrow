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
        { to: "/dashboard/profile", label: "Company Profile", icon: "bi-building" },
      ]}
    />
  );
}

