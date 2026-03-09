import RoleDashboardLayout from "./RoleDashboardLayout";

type Props = {
  onLogout: () => void;
};

export default function AdminLayout({ onLogout }: Props) {
  return (
    <RoleDashboardLayout
      subtitle="Admin"
      heading="Admin Dashboard"
      onLogout={onLogout}
      links={[
        { to: "/dashboard", label: "Overview", icon: "bi-speedometer2", end: true },
        { to: "/dashboard/profile", label: "Admin Profile", icon: "bi-shield-check" },
      ]}
    />
  );
}

