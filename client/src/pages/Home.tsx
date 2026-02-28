import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/token";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getToken());

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <h1 className="display-5 fw-bold mb-3">
                Find a job that suits <br className="d-none d-md-block" />
                your interest &amp; skills.
              </h1>
              <p className="text-muted mb-4">
                Your next opportunity is one search away. Build your profile, tag your skills,
                and grow with mentorship.
              </p>

              {/* Search (UI placeholder) */}
              <div className="card shadow-sm border-0 p-2">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search" />
                      </span>
                      <input className="form-control" placeholder="Job title, keyword..." />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-geo-alt" />
                      </span>
                      <input className="form-control" placeholder="Your location" />
                    </div>
                  </div>

                  <div className="col-12 col-md-3 d-grid">
                    <button className="btn btn-primary" onClick={() => { /* placeholder */ }}>
                      Find Job
                    </button>
                  </div>
                </div>

                <div className="pt-2 px-1 small text-muted">
                  Suggestions: Designer, Programming, Digital Marketing, Video, Animation.
                </div>
              </div>

              <div className="mt-3 d-flex gap-2 flex-wrap">
                {!isLoggedIn ? (
                  <>
                    <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>Sign In</button>
                    <button className="btn btn-primary" onClick={() => navigate("/register")}>Create Account</button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
                )}
              </div>
            </div>

            {/* Illustration */}
            <div className="col-12 col-lg-6">
              <div className="hero-illustration">
                <div className="illu-card">
                  <div className="illu-avatar" />
                  <div className="illu-lines">
                    <div className="line w-75" />
                    <div className="line w-50" />
                    <div className="line w-90" />
                  </div>
                </div>
                <div className="illu-blob" />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="row g-3 mt-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-icon"><i className="bi bi-briefcase" /></div>
                <div>
                  <div className="fw-bold">1,75,324</div>
                  <div className="text-muted small">Live Jobs</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card stat-card-active">
                <div className="stat-icon"><i className="bi bi-building" /></div>
                <div>
                  <div className="fw-bold">97,354</div>
                  <div className="text-muted small">Companies</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-icon"><i className="bi bi-people" /></div>
                <div>
                  <div className="fw-bold">38,47,154</div>
                  <div className="text-muted small">Candidates</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-icon"><i className="bi bi-file-earmark-plus" /></div>
                <div>
                  <div className="fw-bold">7,532</div>
                  <div className="text-muted small">New Jobs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Vacancies */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="h3 fw-bold mb-4">Most Popular Vacancies</h2>
          <div className="row g-3">
            {[
              ["Anesthesiologists", "45,904 Open Positions"],
              ["Surgeons", "50,364 Open Positions"],
              ["Obstetricians-Gynecologists", "43,319 Open Positions"],
              ["Orthodontists", "20,079 Open Positions"],
              ["Maxillofacial Surgeons", "74,875 Open Positions"],
              ["Software Developer", "43,350 Open Positions"],
              ["Psychiatrists", "18,599 Open Positions"],
              ["Data Scientist", "28,200 Open Positions"],
              ["Financial Manager", "61,391 Open Positions"],
              ["Management Analysis", "93,046 Open Positions"],
              ["IT Manager", "50,893 Open Positions"],
              ["Operations Research Analysis", "16,827 Open Positions"],
            ].map(([title, sub]) => (
              <div className="col-12 col-md-6 col-lg-3" key={title}>
                <div className="vacancy-item">
                  <div className="fw-semibold">{title}</div>
                  <div className="text-muted small">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="h3 fw-bold text-center mb-4">How Carrigrow works</h2>

          <div className="how-steps">
            <div className="how-step">
              <div className="how-icon"><i className="bi bi-person-plus" /></div>
              <div className="fw-semibold">Create account</div>
              <div className="text-muted small">Register and choose your role.</div>
            </div>

            <div className="how-step how-step-active">
              <div className="how-icon"><i className="bi bi-upload" /></div>
              <div className="fw-semibold">Build profile</div>
              <div className="text-muted small">Add skills, education, portfolio.</div>
            </div>

            <div className="how-step">
              <div className="how-icon"><i className="bi bi-search" /></div>
              <div className="fw-semibold">Find suitable job</div>
              <div className="text-muted small">Browse jobs (Milestone 2).</div>
            </div>

            <div className="how-step">
              <div className="how-icon"><i className="bi bi-send-check" /></div>
              <div className="fw-semibold">Apply job</div>
              <div className="text-muted small">Apply and track (Milestone 2).</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 fw-bold mb-0">Popular category</h2>
            <button className="btn btn-outline-primary btn-sm" type="button">
              View All <i className="bi bi-arrow-right ms-1" />
            </button>
          </div>

          <div className="row g-3">
            {[
              ["Graphics & Design", "357 Open position", "bi-brush"],
              ["Code & Programming", "312 Open position", "bi-code-slash"],
              ["Digital Marketing", "297 Open position", "bi-megaphone"],
              ["Video & Animation", "247 Open position", "bi-camera-video"],
              ["Music & Audio", "204 Open position", "bi-music-note-beamed"],
              ["Account & Finance", "167 Open position", "bi-currency-dollar"],
              ["Health & Care", "125 Open position", "bi-heart-pulse"],
              ["Data & Science", "57 Open position", "bi-database"],
            ].map(([t, s, icon]) => (
              <div className="col-12 col-sm-6 col-lg-3" key={t}>
                <div className="cat-card">
                  <div className="cat-icon"><i className={`bi ${icon}`} /></div>
                  <div className="fw-semibold">{t}</div>
                  <div className="text-muted small">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}