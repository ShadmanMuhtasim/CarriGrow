import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loading from "../../components/Loading";
import Textarea from "../../components/form/Textarea";
import Badge from "../../components/ui/Badge";
import StatusBadge, { type ApplicationStatus } from "../../components/applications/StatusBadge";
import StatusUpdater from "../../components/applications/StatusUpdater";
import { toastUI } from "../../components/ui/Toast";
import { getEmployerJob, listJobApplicationsForEmployer, updateJobApplicationForEmployer, type JobApplication } from "../../services/jobs";
import type { Job } from "../../types/models";

function getApplicantName(application: JobApplication): string {
  return application.user?.name?.trim() || `Applicant #${application.user_id}`;
}

function getApplicantEmail(application: JobApplication): string {
  return application.user?.email?.trim() || "Not provided";
}

function getApplicantPhone(application: JobApplication): string {
  return application.user?.job_seeker_profile?.phone?.trim() || "Not provided";
}

function getApplicantLocation(application: JobApplication): string {
  return application.user?.job_seeker_profile?.location?.trim() || "Not provided";
}

function getApplicantResume(application: JobApplication): string {
  return application.resume_url || application.user?.job_seeker_profile?.resume_url || "";
}

function getApplicantLinks(application: JobApplication): string[] {
  const profile = application.user?.job_seeker_profile;
  return [profile?.portfolio_url, profile?.linkedin_url, profile?.github_url]
    .map((item) => item?.trim() ?? "")
    .filter((item) => item.length > 0);
}

function displayLinkLabel(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "Profile link";
  }
}

function getCoverLetter(application: JobApplication): string {
  return application.cover_letter?.trim() || "No cover letter was submitted.";
}

export default function ApplicantDetail() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const applicantId = Number(params.applicantId);
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApplicationStatus>("under_review");
  const [notes, setNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

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

        const matchedApplication =
          applicationsResponse.applications.find((item) => item.id === applicantId) ?? null;

        setJob(jobResponse.job);
        setApplication(matchedApplication);
        setStatus(matchedApplication?.status ?? "under_review");
        setNotes(matchedApplication?.employer_notes ?? "");
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load applicant details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (Number.isFinite(jobId) && Number.isFinite(applicantId)) {
      void loadData();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [applicantId, jobId]);

  const timeline = useMemo(
    () => [
      { label: "Application received", active: true },
      { label: "Review in progress", active: ["under_review", "shortlisted", "hired", "rejected"].includes(status) },
      { label: "Shortlisted", active: ["shortlisted", "hired"].includes(status) },
      { label: "Final decision", active: ["rejected", "hired"].includes(status) },
    ],
    [status]
  );

  async function saveStatus() {
    if (!job || !application) {
      return;
    }

    setSavingStatus(true);
    try {
      const response = await updateJobApplicationForEmployer(job.id, application.id, { status });
      setApplication(response.application);
      setStatus(response.application.status);
      toastUI.success(`Status updated to ${status.replace("_", " ")}.`);
    } catch {
      toastUI.error("Could not update status.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveNotes() {
    if (!job || !application) {
      return;
    }

    setSavingNotes(true);
    try {
      const response = await updateJobApplicationForEmployer(job.id, application.id, { employer_notes: notes.trim() || null });
      setApplication(response.application);
      setNotes(response.application.employer_notes ?? "");
      toastUI.success("Notes saved.");
    } catch {
      toastUI.error("Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading) {
    return <Loading label="Loading applicant detail..." />;
  }

  if (!job || !application) {
    return (
      <Card title="Applicant not found">
        <p className="mb-0 text-muted">This applicant record could not be loaded.</p>
      </Card>
    );
  }

  const links = getApplicantLinks(application);
  const resumeUrl = getApplicantResume(application);

  return (
    <div className="vstack gap-3">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Manage Jobs", to: "/dashboard/manage-jobs" },
          { label: "Applicants", to: `/dashboard/manage-jobs/${job.id}/applicants` },
          { label: getApplicantName(application) },
        ]}
      />

      <Card
        title={getApplicantName(application)}
        subtitle={`Applied for ${job.title} on ${application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "N/A"}`}
        actions={<StatusBadge status={status} />}
      >
        <div className="d-flex flex-wrap gap-2">
          <Link to={`/dashboard/manage-jobs/${job.id}/applicants`}>
            <Button variant="outline">Back to applicants</Button>
          </Link>
          <Button variant="secondary" onClick={() => toastUI.info("Messaging is not available yet.")}>
            Message applicant
          </Button>
        </div>
      </Card>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <Card title="Profile Summary">
            <div className="text-center mb-3">
              <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center" style={{ width: 96, height: 96 }}>
                <i className="bi bi-person text-muted fs-3" />
              </div>
            </div>
            <div className="small text-muted">Email</div>
            <div className="mb-2">{getApplicantEmail(application)}</div>
            <div className="small text-muted">Phone</div>
            <div className="mb-2">{getApplicantPhone(application)}</div>
            <div className="small text-muted">Location</div>
            <div className="mb-3">{getApplicantLocation(application)}</div>
            <div className="small text-muted">Links</div>
            <div className="d-flex flex-wrap gap-2">
              {links.length === 0 ? (
                <span className="text-muted small">No links provided.</span>
              ) : (
                links.map((link) => (
                  <a key={link} href={link} target="_blank" rel="noreferrer">
                    <Badge>{displayLinkLabel(link)}</Badge>
                  </a>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="col-12 col-xl-8">
          <Card title="Full Profile Information" subtitle={application.user?.job_seeker_profile?.bio ?? "No biography provided."}>
            <div className="row g-3">
              <div className="col-12">
                <StatusUpdater value={status} onChange={setStatus} onSave={() => void saveStatus()} saving={savingStatus} />
              </div>
              <div className="col-12">
                <div className="border rounded-3 p-3">
                  <div className="fw-semibold mb-2">Resume</div>
                  {resumeUrl ? (
                    <a className="btn btn-sm btn-outline-primary" href={resumeUrl} target="_blank" rel="noreferrer">
                      Open resume link
                    </a>
                  ) : (
                    <p className="text-muted mb-0">No resume URL available.</p>
                  )}
                </div>
              </div>
              <div className="col-12">
                <div className="border rounded-3 p-3">
                  <div className="fw-semibold mb-2">Cover Letter</div>
                  <p className="mb-0">{getCoverLetter(application)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <Card title="Application Timeline">
            <div className="vstack gap-3">
              {timeline.map((item) => (
                <div key={item.label} className="d-flex align-items-center gap-3">
                  <span className={`rounded-circle d-inline-block ${item.active ? "bg-primary" : "bg-light border"}`} style={{ width: 14, height: 14 }} />
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="col-12 col-lg-7">
          <Card
            title="Notes"
            subtitle="Private notes for your hiring team."
            actions={
              <Button type="button" variant="primary" onClick={() => void saveNotes()} loading={savingNotes}>
                Save notes
              </Button>
            }
          >
            <Textarea rows={8} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
