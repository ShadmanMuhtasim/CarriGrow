import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { register } from "../services/auth";
import { setToken } from "../utils/token";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("New User");
  const [email, setEmail] = useState(`newuser${Date.now()}@gmail.com`);
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("job_seeker");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        password,
        password_confirmation: password,
        role,
      });
      setToken(res.access_token);
      navigate("/dashboard");
    } catch (error: any) {
      setErr(error?.response?.data?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h1 className="h3 fw-bold mb-2">Create Account</h1>
                <p className="text-muted mb-4">Choose your role and start building your profile.</p>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="job_seeker">Job Seeker</option>
                      <option value="employer">Employer</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="form-text">Admin is limited to max 4.</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <button disabled={loading} className="btn btn-primary w-100" type="submit">
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <span className="text-muted">Already have an account? </span>
                  <NavLink to="/login">Sign in</NavLink>
                </div>
              </div>
            </div>

            <div className="text-center small text-muted mt-3">
              After registering, you will be redirected to dashboard automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}