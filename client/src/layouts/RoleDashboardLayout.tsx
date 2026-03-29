import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarLink } from "../components/Sidebar";

type RoleDashboardLayoutProps = {
  subtitle: string;
  heading: string;
  links: SidebarLink[];
  onLogout: () => void;
};

export default function RoleDashboardLayout({
  subtitle,
  heading,
  links,
  onLogout,
}: RoleDashboardLayoutProps) {
  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid">
        <div className="row">
          <Sidebar subtitle={subtitle} links={links} onLogout={onLogout} />

          <main className="col-12 col-lg-9 col-xl-10 p-0">
            <div className="dashboard-topbar border-bottom bg-white">
              <div className="container-fluid py-3 d-flex align-items-center justify-content-between">
                <div className="fw-semibold">{heading}</div>
              </div>
            </div>

            <div className="container-fluid py-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

