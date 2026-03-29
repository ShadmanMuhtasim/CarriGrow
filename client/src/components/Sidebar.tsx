import { NavLink } from "react-router-dom";

export type SidebarLink = {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
};

type SidebarProps = {
  subtitle: string;
  links: SidebarLink[];
  onLogout: () => void;
};

export default function Sidebar({ subtitle, links, onLogout }: SidebarProps) {
  return (
    <aside className="col-12 col-lg-3 col-xl-2 p-0">
      <div className="dashboard-sidebar">
        <div className="p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-badge">
              <i className="bi bi-briefcase"></i>
            </div>
            <div>
              <div className="fw-bold">CarriGrow</div>
              <div className="text-muted small">{subtitle}</div>
            </div>
          </div>
        </div>

        <nav className="p-2">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="dash-link">
              <i className={`bi ${link.icon} me-2`} />
              {link.label}
            </NavLink>
          ))}

          <button className="dash-link btn btn-link text-start w-100" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-2" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}

