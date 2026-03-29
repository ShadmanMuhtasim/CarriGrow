import { NavLink } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="display-6 fw-bold">404</h1>
        <p className="text-muted">Page not found.</p>
        <NavLink to="/" className="btn btn-primary">Go Home</NavLink>
      </div>
    </div>
  );
}