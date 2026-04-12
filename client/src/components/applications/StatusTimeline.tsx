import type { JobApplicationStatus } from "../../services/jobs";

type StatusTimelineProps = {
  status: JobApplicationStatus;
};

const stepLabels: Record<JobApplicationStatus, string> = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};

const standardFlow: JobApplicationStatus[] = ["applied", "under_review", "shortlisted", "hired"];
const rejectedFlow: JobApplicationStatus[] = ["applied", "under_review", "rejected"];

function getFlow(status: JobApplicationStatus) {
  return status === "rejected" ? rejectedFlow : standardFlow;
}

export default function StatusTimeline({ status }: StatusTimelineProps) {
  const flow = getFlow(status);
  const activeIndex = Math.max(0, flow.indexOf(status));

  return (
    <div className="vstack gap-1">
      <div className="small text-muted">Status Timeline</div>
      <div className="d-flex align-items-center flex-wrap gap-2">
        {flow.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const dotClass = isCompleted || isActive ? "text-bg-primary" : "text-bg-light border";
          const labelClass = isCompleted || isActive ? "text-body" : "text-muted";

          return (
            <div key={step} className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className={`badge rounded-pill ${dotClass}`} style={{ width: 12, height: 12, padding: 0 }} />
                <span className={`small ${labelClass}`}>{stepLabels[step]}</span>
              </div>
              {index < flow.length - 1 ? <span className="text-muted small">{">"}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
