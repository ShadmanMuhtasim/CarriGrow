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
import { getEmployerJob } from "../../services/jobs";
import type { Job } from "../../types/models";
import { buildApplicantsForJob, type ApplicantRecord } from "./applicantData";

export default function ApplicantDetail() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const applicantId = Number(params.applicantId);
  const [job, setJob] = useState<Job | null>(null);
  const [applicant, setApplicant] = useState<ApplicantRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApplicationStatus>("reviewing");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await getEmployerJob(jobId);
        if (cancelled) {
          return;
        }

        const applicants = buildApplicantsForJob(response.job);
        const matchedApplicant = applicants.find((item) => item.id === applicantId) ?? null;
        setJob(response.job);
        setApplicant(matchedApplicant);
        setStatus(matchedApplicant?.status ?? "reviewing");
        setNotes(matchedApplicant?.notes ?? "");
      } catch {
        toastUI.error("Could not load applicant details.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (Number.isFinite(jobId) && Number.isFinite(applicantId)) {
      loadData();
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
      { label: "Initial review", active: ["reviewing", "shortlisted", "interview", "hired"].includes(status) },
      { label: "Shortlist", active: ["shortlisted", "interview", "hired"].includes(status) },
      { label: "Interview", active: ["interview", "hired"].includes(status) },
      { label: "Final decision", active: ["rejected", "hired"].includes(status) },
    ],
    [status]
  );

  function saveStatus() {
    toastUI.success(`Status updated to ${status}.`);
  }

  function saveNotes() {
    toastUI.success("Employer notes saved locally in the base UI.");
  }

  if (loading) {
    return <Loading label="Loading applicant detail..." />;
  }

  if (!job || !applicant) {
    return (
      <Card title="Applicant not found">
        <p className="mb-0 text-muted">The applicant detail route is wired, but this applicant record could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Manage Jobs", to: "/dashboard/manage-jobs" },
          { label: "Applicants", to: `/dashboard/manage-jobs/${job.id}/applicants` },
          { label: applicant.name },
        ]}
      />

      <Card
        title={applicant.name}
        subtitle={`Applied for ${job.title} on ${applicant.appliedDate}`}
        actions={<StatusBadge status={status} />}
      >
        <div className="d-flex flex-wrap gap-2">
          <Link to={`/dashboard/manage-jobs/${job.id}/applicants`}>
            <Button variant="outline">Back to applicants</Button>
          </Link>
          <Button variant="secondary" onClick={() => toastUI.info("Message composer can be integrated later.")}>
            Message applicant
          </Button>
        </div>
      </Card>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <Card title="Profile Summary">
            <div className="text-center mb-3">
              <img src={applicant.photoUrl} alt={applicant.name} width={96} height={96} className="rounded-circle object-fit-cover" />
            </div>
            <div className="small text-muted">Email</div>
            <div className="mb-2">{applicant.email}</div>
            <div className="small text-muted">Phone</div>
            <div className="mb-2">{applicant.phone}</div>
            <div className="small text-muted">Location</div>
            <div className="mb-3">{applicant.location}</div>
            <div className="small text-muted">Skills</div>
            <div className="d-flex flex-wrap gap-2">
              {applicant.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-12 col-xl-8">
          <Card title="Full Profile Information" subtitle={applicant.experienceSummary}>
            <div className="row g-3">
              <div className="col-12">
                <StatusUpdater value={status} onChange={setStatus} onSave={saveStatus} />
              </div>
              <div className="col-12">
                <div className="border rounded-3 p-3">
                  <div className="fw-semibold mb-2">Resume Viewer</div>
                  <p className="text-muted mb-2">Base embedded resume block for later real file/viewer integration.</p>
                  <div className="ratio ratio-16x9 bg-light rounded border">
                    <div className="d-flex align-items-center justify-content-center text-muted">
                      Resume preview placeholder
                    </div>
                  </div>
                  <a className="btn btn-sm btn-outline-primary mt-3" href={applicant.resumeUrl} target="_blank" rel="noreferrer">
                    Open resume link
                  </a>
                </div>
              </div>
              <div className="col-12">
                <div className="border rounded-3 p-3">
                  <div className="fw-semibold mb-2">Cover Letter</div>
                  <p className="mb-0">{applicant.coverLetter}</p>
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
            subtitle="Employer-only notes scaffold. Backend persistence can be attached later."
            actions={
              <Button type="button" variant="primary" onClick={saveNotes}>
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
