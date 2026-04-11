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
import { getEmployerJob, listJobApplicationsForEmployer, updateJobApplicationForEmployer, type JobApplication } from "../../services/jobs";
import type { Job } from "../../types/models";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
] as const;

type StatusFilter = "all" | ApplicationStatus;

function getApplicantName(application: JobApplication): string {
  return application.user?.name?.trim() || `Applicant #${application.user_id}`;
}

function getApplicantEmail(application: JobApplication): string {
  return application.user?.email?.trim() || "N/A";
}

function getApplicantLocation(application: JobApplication): string {
  return application.user?.job_seeker_profile?.location?.trim() || "Not provided";
}

function getResumeUrl(application: JobApplication): string {
  return application.resume_url || application.user?.job_seeker_profile?.resume_url || "";
}

function getSkillTags(job: Job): string[] {
  const source = job.skills_required ?? [];
  if (!source || source.length === 0) {
    return [];
  }

  return source.slice(0, 4);
}

function downloadCsv(job: Job, applications: JobApplication[]) {
  const rows = [
    ["Name", "Email", "Applied Date", "Status", "Location", "Resume URL"].join(","),
    ...applications.map((application) =>
      [
        getApplicantName(application),
        getApplicantEmail(application),
        application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "N/A",
        application.status,
        getApplicantLocation(application),
        `"${getResumeUrl(application)}"`,
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
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>("under_review");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const [jobResponse, applicationsResponse] = await Promise.all([
          getEmployerJob(jobId),
          listJobApplicationsForEmployer(jobId, { per_page: 50 }),
        ]);

        if (cancelled) {
          return;
        }

        setJob(jobResponse.job);
        setApplications(applicationsResponse.applications);
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load applicants list.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (Number.isFinite(jobId)) {
      void loadData();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = `${getApplicantName(application)} ${getApplicantEmail(application)}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [applications, search, statusFilter]);

  function toggleApplicant(applicationId: number) {
    setSelectedIds((current) =>
      current.includes(applicationId) ? current.filter((id) => id !== applicationId) : [...current, applicationId]
    );
  }

  async function updateApplicantStatus(applicationId: number, status: ApplicationStatus) {
    if (!job) {
      return;
    }

    try {
      const response = await updateJobApplicationForEmployer(job.id, applicationId, { status });
      setApplications((current) => current.map((item) => (item.id === applicationId ? response.application : item)));
      toastUI.success("Application status updated.");
    } catch {
      toastUI.error("Could not update application status.");
    }
  }

  async function bulkUpdateStatus() {
    if (!job) {
      return;
    }

    if (selectedIds.length === 0) {
      toastUI.info("Select applicants first.");
      return;
    }

    try {
      const responses = await Promise.all(
        selectedIds.map((applicationId) =>
          updateJobApplicationForEmployer(job.id, applicationId, { status: bulkStatus })
        )
      );

      const updatedById = new Map<number, JobApplication>();
      responses.forEach((response) => {
        updatedById.set(response.application.id, response.application);
      });

      setApplications((current) => current.map((item) => updatedById.get(item.id) ?? item));
      setSelectedIds([]);
      toastUI.success("Bulk status update applied.");
    } catch {
      toastUI.error("Could not apply bulk status update.");
    }
  }

  if (loading) {
    return <Loading label="Loading applicants list..." />;
  }

  if (!job) {
    return (
      <Card title="Applicants unavailable">
        <p className="mb-0 text-muted">The job could not be loaded.</p>
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
        subtitle="Review applicants, update statuses, and export candidate data."
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link to={`/dashboard/manage-jobs/${job.id}/analytics`}>
              <Button variant="outline">Analytics</Button>
            </Link>
            <Button type="button" variant="secondary" onClick={() => downloadCsv(job, filteredApplications)}>
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
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            />
          </div>
          <div className="col-12 col-lg-3">
            <label className="form-label">Search applicant</label>
            <input
              className="form-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
            />
          </div>
          <div className="col-12 col-lg-6">
            <div className="border rounded-3 p-3 h-100">
              <StatusUpdater value={bulkStatus} onChange={setBulkStatus} onSave={() => void bulkUpdateStatus()} />
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted">
            No applications found for the selected filters.
          </div>
        ) : (
          <div className="row g-3">
            {filteredApplications.map((application) => (
              <div key={application.id} className="col-12 col-xl-6">
                <Card className="h-100">
                  <div className="d-flex gap-3 align-items-start">
                    <input
                      className="form-check-input mt-2"
                      type="checkbox"
                      checked={selectedIds.includes(application.id)}
                      onChange={() => toggleApplicant(application.id)}
                    />
                    <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 64, height: 64 }}>
                      <i className="bi bi-person text-muted" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap justify-content-between gap-2">
                        <div>
                          <div className="fw-semibold">{getApplicantName(application)}</div>
                          <div className="text-muted small">
                            Applied on {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>

                      <div className="small text-muted mt-2">{getApplicantLocation(application)}</div>
                      <div className="small mt-1">{getApplicantEmail(application)}</div>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {getSkillTags(job).map((skill) => (
                          <Badge key={`${application.id}-${skill}`}>{skill}</Badge>
                        ))}
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <Link to={`/dashboard/manage-jobs/${job.id}/applicants/${application.id}`}>
                          <Button type="button" variant="outline">View profile</Button>
                        </Link>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            void updateApplicantStatus(
                              application.id,
                              application.status === "shortlisted" ? "under_review" : "shortlisted"
                            )
                          }
                        >
                          {application.status === "shortlisted" ? "Move to review" : "Shortlist"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => toastUI.info("Messaging is not available yet.")}>
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
