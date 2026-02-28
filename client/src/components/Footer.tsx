export default function Footer() {
  return (
    <footer className="footer-dark mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-badge">
                <i className="bi bi-briefcase"></i>
              </span>
              <span className="fw-bold fs-5">Carrigrow</span>
            </div>
            <div className="text-muted small">
              Call now: 019-676XXXXX <br />
              <span>CA 8/6, Corner Rd, Dhaka</span>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <div className="footer-title">Quick Link</div>
            <ul className="list-unstyled footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <div className="footer-title">Candidate</div>
            <ul className="list-unstyled footer-links">
              <li><a href="#browse-jobs">Browse Jobs</a></li>
              <li><a href="#browse-employers">Browse Employers</a></li>
              <li><a href="#candidate-dashboard">Candidate Dashboard</a></li>
              <li><a href="#saved-jobs">Saved Jobs</a></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <div className="footer-title">Employers</div>
            <ul className="list-unstyled footer-links">
              <li><a href="#post-job">Post a Job</a></li>
              <li><a href="#browse-candidates">Browse Candidates</a></li>
              <li><a href="#employer-dashboard">Employers Dashboard</a></li>
              <li><a href="#applications">Applications</a></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <div className="footer-title">Support</div>
            <ul className="list-unstyled footer-links">
              <li><a href="#faq">Faqs</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>

        <hr className="footer-hr my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="text-muted small">© 2026 Carrigrow — Job Portal. All rights reserved.</div>

          <div className="d-flex gap-3 fs-5">
            <a className="footer-social" href="#facebook" aria-label="Facebook"><i className="bi bi-facebook" /></a>
            <a className="footer-social" href="#instagram" aria-label="Instagram"><i className="bi bi-instagram" /></a>
            <a className="footer-social" href="#twitter" aria-label="Twitter"><i className="bi bi-twitter-x" /></a>
            <a className="footer-social" href="#linkedin" aria-label="LinkedIn"><i className="bi bi-linkedin" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}