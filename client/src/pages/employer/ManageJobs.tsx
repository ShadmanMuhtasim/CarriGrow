import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import Modal from "../../components/ui/Modal";
import Select from "../../components/form/Select";
import { toastUI } from "../../components/ui/Toast";
import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import { createEmployerJob, deleteEmployerJob, listEmployerJobs, updateEmployerJob } from "../../services/jobs";
import type { Job, JobStatus } from "../../types/models";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "closed", label: "Closed" },
  { value: "filled", label: "Filled" },
] as const;

function asNumber(value: Job["salary_min"] | Job["salary_max"] | undefined): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function duplicatePayload(job: Job) {
  return {
    title: `${job.title} (Copy)`,
    description: job.description,
    requirements: job.requirements ?? "",
    responsibilities: job.responsibilities ?? "",
    location: job.location ?? "",
    salary_min: asNumber(job.salary_min),
    salary_max: asNumber(job.salary_max),
    salary_currency: job.salary_currency ?? "USD",
    employment_type: job.employment_type,
    experience_level: job.experience_level ?? "entry",
    education_required: job.education_required ?? "",
    skills_required: job.skills_required ?? [],
    application_deadline: job.application_deadline ?? "",
    status: "draft" as const,
  };
}

function formatCurrency(job: Job): string {
  const currency = job.salary_currency ?? "USD";
  const min = asNumber(job.salary_min);
  const max = asNumber(job.salary_max);
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"" | "publish" | "close" | "delete">("");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      try {
        const response = await listEmployerJobs();
        if (!cancelled) {
          setJobs(response.jobs);
        }
      } catch {
        toastUI.error("Could not load employer jobs.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") {
      return jobs;
    }
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      published: jobs.filter((job) => job.status === "published").length,
      draft: jobs.filter((job) => job.status === "draft").length,
      applications: jobs.reduce((sum, job) => sum + (job.applications_count ?? 0), 0),
    };
  }, [jobs]);

  function toggleSelection(jobId: number) {
    setSelectedIds((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
  }

  function selectAllVisible() {
    setSelectedIds(filteredJobs.map((job) => job.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function handleDuplicate(job: Job) {
    try {
      const response = await createEmployerJob(duplicatePayload(job));
      setJobs((current) => [response.job, ...current]);
      toastUI.success("Job duplicated as draft.");
    } catch {
      toastUI.error("Could not duplicate this job.");
    }
  }

  async function handleStatusChange(job: Job, status: JobStatus) {
    try {
      const response = await updateEmployerJob(job.id, { status });
      setJobs((current) => current.map((item) => (item.id === job.id ? response.job : item)));
      toastUI.success(`Job marked as ${status}.`);
    } catch {
      toastUI.error("Could not update job status.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteEmployerJob(deleteTarget.id);
      setJobs((current) => current.filter((job) => job.id !== deleteTarget.id));
      setSelectedIds((current) => current.filter((id) => id !== deleteTarget.id));
      toastUI.success("Job deleted.");
    } catch {
      toastUI.error("Could not delete this job.");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function applyBulkAction() {
    if (!bulkAction || selectedIds.length === 0) {
      toastUI.info("Select jobs and a bulk action first.");
      return;
    }

    setBulkApplying(true);

    try {
      if (bulkAction === "delete") {
        await Promise.all(selectedIds.map((id) => deleteEmployerJob(id)));
        setJobs((current) => current.filter((job) => !selectedIds.includes(job.id)));
      } else {
        const nextStatus: JobStatus = bulkAction === "publish" ? "published" : "closed";
        const updated = await Promise.all(
          selectedIds.map(async (id) => {
            const response = await updateEmployerJob(id, { status: nextStatus });
            return response.job;
          })
        );

        const updatedMap = new Map(updated.map((job) => [job.id, job]));
        setJobs((current) => current.map((job) => updatedMap.get(job.id) ?? job));
      }

      toastUI.success("Bulk action completed.");
      setSelectedIds([]);
      setBulkAction("");
    } catch {
      toastUI.error("Bulk action failed. Backend support can be refined later.");
    } finally {
      setBulkApplying(false);
    }
  }

  if (loading) {
    return <Loading label="Loading employer jobs..." />;
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Manage Jobs" }]} />

      <div className="row g-3">
        <div className="col-12 col-md-3">
          <Card title="Total Jobs">
            <div className="display-6 mb-0">{stats.total}</div>
          </Card>
        </div>
        <div className="col-12 col-md-3">
          <Card title="Published">
            <div className="display-6 mb-0">{stats.published}</div>
          </Card>
        </div>
        <div className="col-12 col-md-3">
          <Card title="Drafts">
            <div className="display-6 mb-0">{stats.draft}</div>
          </Card>
        </div>
        <div className="col-12 col-md-3">
          <Card title="Applications">
            <div className="display-6 mb-0">{stats.applications}</div>
          </Card>
        </div>
      </div>

      <Card
        title="My Jobs"
        subtitle="Issue #20 base implementation with status filtering, quick stats, row actions, and bulk actions."
        actions={
          <Link to="/dashboard/post-job">
            <Button icon={<i className="bi bi-plus-lg" />}>New job</Button>
          </Link>
        }
      >
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-4">
            <Select
              label="Filter by status"
              options={statusOptions.map((option) => ({ ...option }))}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | JobStatus)}
            />
          </div>
          <div className="col-12 col-lg-8">
            <div className="border rounded-3 p-3 h-100">
              <div className="row g-2 align-items-end">
                <div className="col-12 col-md-5">
                  <Select
                    label="Bulk action"
                    options={[
                      { value: "", label: "Choose action" },
                      { value: "publish", label: "Publish selected" },
                      { value: "close", label: "Close selected" },
                      { value: "delete", label: "Delete selected" },
                    ]}
                    value={bulkAction}
                    onChange={(event) => setBulkAction(event.target.value as typeof bulkAction)}
                  />
                </div>
                <div className="col-12 col-md-7 d-flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={selectAllVisible}>
                    Select visible
                  </Button>
                  <Button type="button" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Button type="button" variant="primary" loading={bulkApplying} onClick={applyBulkAction}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="border rounded-3 p-4 text-center text-muted">No jobs found for this filter yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: 44 }} />
                  <th>Job</th>
                  <th>Status</th>
                  <th>Compensation</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedIds.includes(job.id)}
                        onChange={() => toggleSelection(job.id)}
                      />
                    </td>
                    <td>
                      <div className="fw-semibold">{job.title}</div>
                      <div className="text-muted small">
                        {job.location ?? "Remote / TBD"} • {job.employment_type.replace("_", " ")}
                      </div>
                    </td>
                    <td>
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td>{formatCurrency(job)}</td>
                    <td>
                      <div className="small">Views: {job.views_count ?? 0}</div>
                      <div className="small">Applications: {job.applications_count ?? 0}</div>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Link to={`/dashboard/manage-jobs/${job.id}/edit`}>
                          <Button type="button" variant="outline">Edit</Button>
                        </Link>
                        <Button type="button" variant="secondary" onClick={() => handleDuplicate(job)}>
                          Duplicate
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleStatusChange(job, job.status === "closed" ? "published" : "closed")}
                        >
                          {job.status === "closed" ? "Reopen" : "Close"}
                        </Button>
                        <Link to={`/dashboard/manage-jobs/${job.id}/analytics`}>
                          <Button type="button" variant="outline">Analytics</Button>
                        </Link>
                        <Link to={`/dashboard/manage-jobs/${job.id}/applicants`}>
                          <Button type="button" variant="outline">Applicants</Button>
                        </Link>
                        <Button type="button" variant="danger" onClick={() => setDeleteTarget(job)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete job"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="mb-0">
          Delete <strong>{deleteTarget?.title}</strong>? This is wired as a real delete action against the employer jobs API.
        </p>
      </Modal>
    </div>
  );
}
