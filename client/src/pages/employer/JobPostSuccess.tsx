import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function JobPostSuccess() {
  const location = useLocation();
  const title = (location.state as { title?: string } | null)?.title ?? "Your job post";

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Post Job", to: "/dashboard/post-job" }, { label: "Success" }]} />

      <Card title="Job published" subtitle="Base success page for Issue #17. Contributors can extend this with analytics and share flows later.">
        <div className="py-3">
          <div className="display-6 mb-2">
            <i className="bi bi-check-circle text-success me-2" />
            {title}
          </div>
          <p className="text-muted mb-4">The posting flow is wired. Review, management tools, and richer success actions can build on this route.</p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/dashboard/post-job">
              <Button variant="primary">Post another job</Button>
            </Link>
            <Link to="/dashboard/manage-jobs">
              <Button variant="outline">Go to manage jobs</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
