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

      <Card title={title} subtitle="This section is available from your dashboard navigation.">
        <p className="mb-0 text-muted">
          Content for this section will appear here.
        </p>
      </Card>
    </div>
  );
}
