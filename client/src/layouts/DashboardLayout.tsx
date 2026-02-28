import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { getToken } from "../utils/token";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const token = getToken();

  const onLogout = async () => {
    try {
      if (token) await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-12 col-lg-3 col-xl-2 p-0">
            <div className="dashboard-sidebar">
              <div className="p-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-badge">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <div>
                    <div className="fw-bold">CarriGrow</div>
                    <div className="text-muted small">Dashboard</div>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                <NavLink to="/dashboard" end className="dash-link">
                  <i className="bi bi-speedometer2 me-2" />
                  Overview
                </NavLink>

                <NavLink to="/dashboard/profile" className="dash-link">
                  <i className="bi bi-person-badge me-2" />
                  Profile
                </NavLink>

                <button className="dash-link btn btn-link text-start w-100" onClick={onLogout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="col-12 col-lg-9 col-xl-10 p-0">
            <div className="dashboard-topbar border-bottom bg-white">
              <div className="container-fluid py-3 d-flex align-items-center justify-content-between">
                <div className="fw-semibold">Welcome</div>
               
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