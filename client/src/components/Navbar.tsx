import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Badge from "./ui/Badge";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky-top bg-white border-bottom">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container py-2">
          <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
            <span className="brand-badge">
              <i className="bi bi-briefcase"></i>
            </span>
            <span className="fw-bold">Carrigrow</span>
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMain"
            aria-controls="navMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navMain">
            {/* search bar (UI placeholder) */}
            <form className="d-flex ms-lg-4 my-3 my-lg-0 flex-grow-1 nav-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search" />
                </span>
                <input
                  className="form-control border-start-0"
                  placeholder="Job title, keyword, company"
                  aria-label="Search"
                />
              </div>
            </form>

            <ul className="navbar-nav ms-lg-3 me-lg-3 mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className="nav-link">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#find-job">
                  Find Job
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#employers">
                  Employers
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#candidates">
                  Candidates
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#pricing">
                  Pricing Plans
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#support">
                  Customer Supports
                </a>
              </li>
            </ul>

            <div className="d-flex gap-2">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className="btn btn-outline-primary">
                    Sign In
                  </NavLink>
                  <button className="btn btn-primary" type="button" onClick={() => navigate("/login")}>
                    Post A Jobs
                  </button>
                </>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <i className="bi bi-person-circle" />
                    <span>{user?.name ?? "User"}</span>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end ${menuOpen ? "show" : ""}`}>
                    <li className="px-3 py-2">
                      <div className="small text-muted">Role</div>
                      <Badge variant="light">{(user?.role ?? "user").replace("_", " ")}</Badge>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/dashboard");
                        }}
                      >
                        Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/dashboard/profile");
                        }}
                      >
                        My Profile
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" type="button" onClick={onLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
