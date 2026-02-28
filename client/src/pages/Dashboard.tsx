import { useEffect, useState } from "react";
import { getMe } from "../services/user";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        setUser(res.user);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h2 className="h4 fw-bold mb-1">Overview</h2>
                <div className="text-muted">Role-based dashboard (Milestone 1)</div>
              </div>
              <span className="badge text-bg-primary text-capitalize">{user?.role}</span>
            </div>

            <hr />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3">
                  <div className="text-muted small">Name</div>
                  <div className="fw-semibold">{user?.name}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3">
                  <div className="text-muted small">Email</div>
                  <div className="fw-semibold">{user?.email}</div>
                </div>
              </div>
              <div className="col-12">
                <div className="p-3 border rounded-3">
                  <div className="text-muted small mb-2">Skills</div>
                  <div className="d-flex gap-2 flex-wrap">
                    {(user?.skills ?? []).length ? (
                      user.skills.map((s: any) => (
                        <span key={s.id} className="badge rounded-pill text-bg-light border">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">No skills yet (go to Profile and add).</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-3 mb-0">
              Next milestones will add Jobs, Applications, Mentorship Forum, and Skill Matching.
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h3 className="h5 fw-bold">Quick Actions</h3>
            <div className="d-grid gap-2 mt-3">
              <a className="btn btn-outline-primary" href="/dashboard/profile">
                Update Profile
              </a>
              <button className="btn btn-primary" disabled>
                Find Jobs (Milestone 2)
              </button>
              <button className="btn btn-primary" disabled>
                Mentorship Forum (Milestone 3)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}