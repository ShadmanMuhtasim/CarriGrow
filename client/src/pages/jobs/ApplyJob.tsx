import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ApplicationForm, {
  type ApplicationFormSubmitPayload,
  type ApplicationProfileDefaults,
} from "../../components/applications/ApplicationForm";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { applyToJob, getPublicJob } from "../../services/jobs";
import type { Job } from "../../types/models";
import { getApiErrorMessage } from "../../utils/apiError";

function collectProfileDefaults(user: ReturnType<typeof useAuth>["user"]): ApplicationProfileDefaults {
  const profile = user?.jobSeekerProfile ?? user?.job_seeker_profile;

  const links = [profile?.portfolio_url, profile?.linkedin_url, profile?.github_url]
    .map((item) => item?.trim() ?? "")
    .filter((item) => item.length > 0);

  return {
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: profile?.phone ?? "",
    resumeUrl: profile?.resume_url ?? "",
    portfolioLinks: links.length > 0 ? links : undefined,
  };
}

function toAdditionalDocuments(payload: ApplicationFormSubmitPayload) {
  const toLine = (value: string) => value.trim().slice(0, 240);
  const items = [...payload.additional_documents];

  payload.portfolio_links.forEach((link, index) => {
    items.push(toLine(`portfolio_link_${index + 1}: ${link}`));
  });

  payload.additional_questions.forEach((item, index) => {
    items.push(toLine(`question_${index + 1}: ${item.question} | answer: ${item.answer}`));
  });

  return items.map((item) => item.trim()).filter((item) => item.length > 0);
}

export default function ApplyJob() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { jobId } = useParams();

  const parsedJobId = useMemo(() => {
    const parsed = Number(jobId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [jobId]);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!parsedJobId) {
      setLoading(false);
      return;
    }
    const targetJobId: number = parsedJobId;

    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      try {
        const response = await getPublicJob(targetJobId);
        if (!cancelled) {
          setJob(response.job);
        }
      } catch {
        if (!cancelled) {
          setJob(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [parsedJobId]);

  async function handleSubmit(payload: ApplicationFormSubmitPayload) {
    if (!parsedJobId || !job) {
      return;
    }

    setSubmitting(true);
    try {
      const additionalDocuments = toAdditionalDocuments(payload);
      const response = await applyToJob(parsedJobId, {
        resume_url: payload.resume_url,
        cover_letter: payload.cover_letter,
        additional_documents: additionalDocuments.length > 0 ? additionalDocuments : undefined,
      });

      toastUI.success("Application submitted.");
      navigate(`/jobs/${parsedJobId}/apply/success`, {
        state: {
          jobTitle: job.title,
          status: response.application.status,
          applicationId: response.application.id,
          submittedAt: response.application.applied_at ?? new Date().toISOString(),
        },
      });
    } catch (error: unknown) {
      toastUI.error(getApiErrorMessage(error, "Could not submit application right now."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Loading label="Loading application form..." />;
  }

  if (!job || !parsedJobId) {
    return (
      <div className="container py-4">
        <Card title="Application unavailable">
          <p className="text-muted mb-3">This job could not be loaded for application.</p>
          <Link to="/jobs">
            <Button variant="outline">Back to jobs</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-4">
        <div className="vstack gap-3">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: job.title }, { label: "Apply" }]} />
          <Card title="Sign in required" subtitle="You need an account to submit a job application.">
            <div className="d-flex flex-wrap gap-2">
              <Link to="/login">
                <Button variant="primary">Sign in</Button>
              </Link>
              <Link to={`/jobs/${parsedJobId}`}>
                <Button variant="outline">Back to job</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role !== "job_seeker") {
    return (
      <div className="container py-4">
        <div className="vstack gap-3">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: job.title }, { label: "Apply" }]} />
          <Card title="Job seeker role required">
            <p className="text-muted mb-3">Only job seeker accounts can apply to this job.</p>
            <Link to={`/jobs/${parsedJobId}`}>
              <Button variant="outline">Back to job</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs", to: "/jobs" }, { label: job.title, to: `/jobs/${job.id}` }, { label: "Apply" }]} />

        <Card
          title={`Apply for ${job.title}`}
          subtitle="Issue #22 base implementation: resume upload, rich-text cover letter, additional questions, portfolio links, and profile-assisted apply."
        >
          <ApplicationForm profileDefaults={collectProfileDefaults(user)} submitting={submitting} onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
