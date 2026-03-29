import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Card from "../components/ui/Card";

function titleFromSection(section: string): string {
  return section
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DashboardSection() {
  const params = useParams();
  const section = params.section ?? "section";
  const title = useMemo(() => titleFromSection(section), [section]);

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: title }]} />

      <Card title={title} subtitle="Milestone 1 structural page for role-based navigation.">
        <p className="mb-0 text-muted">
          This section is wired for navigation and will be functionally expanded in Milestone 2/3.
        </p>
      </Card>
    </div>
  );
}
