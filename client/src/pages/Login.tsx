import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { login } from "../services/auth";
import { setToken } from "../utils/token";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("testuser3@gmail.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      setToken(res.access_token);
      navigate("/dashboard");
    } catch (error: any) {
      setErr(error?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h1 className="h3 fw-bold mb-2">Sign In</h1>
                <p className="text-muted mb-4">Access your dashboard and profile.</p>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={onSubmit} className="vstack gap-3">
                  <div>
                    <label className="form-label">Email</label>
                    <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <label className="form-label">Password</label>
                    <input
                      className="form-control"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button disabled={loading} className="btn btn-primary w-100" type="submit">
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <span className="text-muted">No account? </span>
                  <NavLink to="/register">Register</NavLink>
                </div>
              </div>
            </div>

            <div className="text-center small text-muted mt-3">
              Tip: use your seeded user or the one you registered in Postman.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}