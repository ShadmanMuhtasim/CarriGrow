import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import Select from "../../components/form/Select";
import Badge from "../../components/ui/Badge";
import { toastUI } from "../../components/ui/Toast";
import StatusBadge, { type ApplicationStatus } from "../../components/applications/StatusBadge";
import StatusUpdater from "../../components/applications/StatusUpdater";
import { getEmployerJob } from "../../services/jobs";
import type { Job } from "../../types/models";
import { buildApplicantsForJob, type ApplicantRecord } from "./applicantData";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
] as const;

function collectSkillOptions(applicants: ApplicantRecord[]): string[] {
  return [...new Set(applicants.flatMap((applicant) => applicant.skills))].sort((a, b) => a.localeCompare(b));
}

function downloadCsv(job: Job, applicants: ApplicantRecord[]) {
  const rows = [
    ["Name", "Email", "Applied Date", "Status", "Location", "Match", "Skills"].join(","),
    ...applicants.map((applicant) =>
      [
        applicant.name,
        applicant.email,
        applicant.appliedDate,
        applicant.status,
        applicant.location,
        String(applicant.match),
        `"${applicant.skills.join(" | ")}"`,
      ].join(",")
    ),
  ];

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${job.title.toLowerCase().replace(/\s+/g, "-")}-applicants.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ApplicantsList() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>("reviewing");

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        const response = await getEmployerJob(jobId);
        if (cancelled) {
          return;
        }

        setJob(response.job);
        setApplicants(buildApplicantsForJob(response.job));
      } catch {
        toastUI.error("Could not load applicants list.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (Number.isFinite(jobId)) {
      loadJob();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const skillOptions = useMemo(() => collectSkillOptions(applicants), [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesStatus = statusFilter === "all" || applicant.status === statusFilter;
      const matchesSkill = skillFilter === "all" || applicant.skills.includes(skillFilter);
      return matchesStatus && matchesSkill;
    });
  }, [applicants, statusFilter, skillFilter]);

  function toggleApplicant(applicantId: number) {
    setSelectedIds((current) =>
      current.includes(applicantId) ? current.filter((id) => id !== applicantId) : [...current, applicantId]
    );
  }

  function updateApplicantStatus(applicantId: number, status: ApplicationStatus) {
    setApplicants((current) => current.map((applicant) => (applicant.id === applicantId ? { ...applicant, status } : applicant)));
  }

  function bulkUpdateStatus() {
    if (selectedIds.length === 0) {
      toastUI.info("Select applicants first.");
      return;
    }

    setApplicants((current) =>
      current.map((applicant) => (selectedIds.includes(applicant.id) ? { ...applicant, status: bulkStatus } : applicant))
    );
    setSelectedIds([]);
    toastUI.success("Bulk status update applied.");
  }

  if (loading) {
    return <Loading label="Loading applicants list..." />;
  }

  if (!job) {
    return (
      <Card title="Applicants unavailable">
        <p className="mb-0 text-muted">The applicants list base page is wired, but the job could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Manage Jobs", to: "/dashboard/manage-jobs" },
          { label: "Applicants" },
        ]}
      />

      <Card
        title={`Applicants for ${job.title}`}
        subtitle="Issue #23 base implementation with filters, bulk status updates, quick actions, and CSV export."
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link to={`/dashboard/manage-jobs/${job.id}/analytics`}>
              <Button variant="outline">Analytics</Button>
            </Link>
            <Button type="button" variant="secondary" onClick={() => downloadCsv(job, filteredApplicants)}>
              Export CSV
            </Button>
          </div>
        }
      >
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-3">
            <Select
              label="Filter by status"
              options={statusOptions.map((option) => ({ ...option }))}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | ApplicationStatus)}
            />
          </div>
          <div className="col-12 col-lg-3">
            <Select
              label="Filter by skill"
              options={[{ value: "all", label: "All skills" }, ...skillOptions.map((skill) => ({ value: skill, label: skill }))]}
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
            />
          </div>
          <div className="col-12 col-lg-6">
            <div className="border rounded-3 p-3 h-100">
              <StatusUpdater value={bulkStatus} onChange={setBulkStatus} onSave={bulkUpdateStatus} />
            </div>
          </div>
        </div>

        <div className="row g-3">
          {filteredApplicants.map((applicant) => (
            <div key={applicant.id} className="col-12 col-xl-6">
              <Card className="h-100">
                <div className="d-flex gap-3 align-items-start">
                  <input
                    className="form-check-input mt-2"
                    type="checkbox"
                    checked={selectedIds.includes(applicant.id)}
                    onChange={() => toggleApplicant(applicant.id)}
                  />
                  <img
                    src={applicant.photoUrl}
                    alt={applicant.name}
                    width={64}
                    height={64}
                    className="rounded-circle object-fit-cover flex-shrink-0"
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                      <div>
                        <div className="fw-semibold">{applicant.name}</div>
                        <div className="text-muted small">Applied on {applicant.appliedDate}</div>
                      </div>
                      <StatusBadge status={applicant.status} />
                    </div>

                    <div className="small text-muted mt-2">{applicant.location}</div>
                    <div className="small mt-1">Match score: {applicant.match}%</div>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {applicant.skills.map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))}
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <Link to={`/dashboard/manage-jobs/${job.id}/applicants/${applicant.id}`}>
                        <Button type="button" variant="outline">View profile</Button>
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => updateApplicantStatus(applicant.id, applicant.status === "shortlisted" ? "interview" : "shortlisted")}
                      >
                        {applicant.status === "shortlisted" ? "Move to interview" : "Shortlist"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => toastUI.info("Messaging flow can be connected later.")}>
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
