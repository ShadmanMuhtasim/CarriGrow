import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Breadcrumbs from "../../components/Breadcrumbs";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import SkillSelector from "../../components/SkillSelector";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/Loading";
import { toastUI } from "../../components/ui/Toast";
import { listSkills } from "../../services/skills";
import { createEmployerJob, updateEmployerJob, type JobPayload } from "../../services/jobs";
import type { Skill } from "../../types/models";
import type { SkillAssignment } from "../../services/user";
import JobFormStep1 from "../../components/jobs/JobFormStep1";
import JobFormStep2 from "../../components/jobs/JobFormStep2";
import JobFormStep3 from "../../components/jobs/JobFormStep3";
import JobPreview from "../../components/jobs/JobPreview";
import { defaultJobFormValues, jobDraftStorageKey, jobFormSchema, stepFields, type JobFormValues } from "../../components/jobs/jobFormSchema";

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Description" },
  { id: 3, title: "Compensation" },
  { id: 4, title: "Skills" },
  { id: 5, title: "Review" },
] as const;

type PostJobProps = {
  mode?: "create" | "edit";
  initialJobId?: number | null;
  initialValues?: Partial<JobFormValues>;
  initialSkills?: SkillAssignment[];
};

type StoredDraft = {
  values: JobFormValues;
  skills: SkillAssignment[];
  savedAt: string;
  remoteJobId?: number | null;
};

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toJobPayload(values: JobFormValues, skills: SkillAssignment[], allSkills: Skill[], status: JobPayload["status"]): JobPayload {
  return {
    title: values.title,
    description: values.description,
    requirements: values.requirements,
    responsibilities: values.responsibilities,
    location: values.location,
    salary_min: parseNumber(values.salary_min),
    salary_max: parseNumber(values.salary_max),
    salary_currency: values.salary_currency,
    employment_type: values.employment_type,
    experience_level: values.experience_level,
    education_required: values.education_required,
    skills_required: skills
      .map((item) => allSkills.find((skill) => skill.id === item.skill_id)?.name)
      .filter((name): name is string => Boolean(name)),
    application_deadline: values.application_deadline,
    status,
  };
}

export default function PostJob({
  mode = "create",
  initialJobId = null,
  initialValues,
  initialSkills,
}: PostJobProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillAssignment[]>(initialSkills ?? []);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [remoteJobId, setRemoteJobId] = useState<number | null>(initialJobId);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      ...defaultJobFormValues,
      ...initialValues,
    },
  });

  const values = watch();

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      try {
        const response = await listSkills();
        if (!cancelled) {
          setAllSkills(response.skills);
        }
      } catch {
        toastUI.error("Could not load skills for the job form.");
      } finally {
        if (!cancelled) {
          setLoadingSkills(false);
        }
      }
    }

    loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    const rawDraft = window.localStorage.getItem(jobDraftStorageKey);
    if (!rawDraft) {
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as StoredDraft;
      reset(draft.values);
      setSelectedSkills(draft.skills ?? []);
      setRemoteJobId(draft.remoteJobId ?? null);
    } catch {
      window.localStorage.removeItem(jobDraftStorageKey);
    }
  }, [mode, reset]);

  const progress = useMemo(() => Math.round((currentStep / steps.length) * 100), [currentStep]);

  async function goToNextStep() {
    const fields = stepFields[currentStep];
    const valid = await trigger(fields);

    if (!valid) {
      toastUI.error("Fix the errors in this step before continuing.");
      return;
    }

    if (currentStep === 4 && selectedSkills.length === 0) {
      toastUI.error("Select at least one required skill.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length));
  }

  function persistLocalDraft(nextValues: JobFormValues) {
    const snapshot: StoredDraft = {
      values: nextValues,
      skills: selectedSkills,
      savedAt: new Date().toISOString(),
      remoteJobId,
    };
    window.localStorage.setItem(jobDraftStorageKey, JSON.stringify(snapshot));
  }

  async function saveDraft() {
    const snapshot = watch();
    persistLocalDraft(snapshot);
    setSavingDraft(true);

    try {
      const payload = toJobPayload(snapshot, selectedSkills, allSkills, "draft");

      if (remoteJobId) {
        await updateEmployerJob(remoteJobId, payload);
      } else {
        const response = await createEmployerJob(payload);
        setRemoteJobId(response.job.id);
        persistLocalDraft(snapshot);
      }

      toastUI.success("Draft saved.");
    } catch {
      toastUI.info("Draft stored locally. Backend fields can be refined later.");
    } finally {
      setSavingDraft(false);
    }
  }

  const submit = handleSubmit(async (submittedValues: JobFormValues) => {
    if (selectedSkills.length === 0) {
      setCurrentStep(4);
      toastUI.error("Select at least one required skill before publishing.");
      return;
    }

    setPublishing(true);

    try {
      const payload = toJobPayload(submittedValues, selectedSkills, allSkills, "published");
      const response = remoteJobId
        ? await updateEmployerJob(remoteJobId, payload)
        : await createEmployerJob(payload);

      window.localStorage.removeItem(jobDraftStorageKey);
      navigate("/dashboard/post-job/success", {
        state: { title: response.job.title },
      });
    } catch {
      toastUI.error("Publishing failed. The base UI is ready, but backend alignment may still need contributor follow-up.");
    } finally {
      setPublishing(false);
    }
  });

  if (loadingSkills) {
    return <Loading label="Loading job form..." />;
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: mode === "edit" ? "Edit Job" : "Post Job" }]} />

      <Card
        title={mode === "edit" ? "Edit employer job" : "Create a new job post"}
        subtitle="Issue #17 base implementation: multi-step flow, validation, preview, draft save, and publish route."
        actions={<Badge variant="primary">{progress}% complete</Badge>}
      >
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
          <div className="d-flex flex-wrap gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`btn btn-sm ${currentStep === step.id ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setCurrentStep(step.id)}
              >
                {step.id}. {step.title}
              </button>
            ))}
          </div>
          <div className="d-flex gap-2">
            <Button type="button" variant="outline" onClick={() => setPreviewMode((value) => !value)}>
              {previewMode ? "Hide preview" : "Preview"}
            </Button>
            <Button type="button" variant="secondary" loading={savingDraft} onClick={saveDraft}>
              Save draft
            </Button>
          </div>
        </div>

        <div className="progress mb-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {previewMode ? (
          <JobPreview values={values} skills={selectedSkills} allSkills={allSkills} />
        ) : (
          <form onSubmit={submit} className="vstack gap-4">
            {currentStep === 1 ? <JobFormStep1 register={register} errors={errors} /> : null}
            {currentStep === 2 ? <JobFormStep2 register={register} errors={errors} /> : null}
            {currentStep === 3 ? <JobFormStep3 register={register} errors={errors} /> : null}

            {currentStep === 4 ? (
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <Input
                    label="Education Requirement"
                    placeholder="Bachelor's degree in CSE or equivalent experience"
                    error={errors.education_required?.message}
                    {...register("education_required")}
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <Input label="Application Deadline" type="date" error={errors.application_deadline?.message} {...register("application_deadline")} />
                </div>
                <div className="col-12">
                  <SkillSelector allSkills={allSkills} value={selectedSkills} onChange={setSelectedSkills} />
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? <JobPreview values={values} skills={selectedSkills} allSkills={allSkills} /> : null}

            <div className="d-flex flex-wrap justify-content-between gap-2">
              <div className="d-flex gap-2">
                <Button type="button" variant="outline" disabled={currentStep === 1} onClick={() => setCurrentStep((step) => Math.max(step - 1, 1))}>
                  Previous
                </Button>
                {currentStep < 5 ? (
                  <Button type="button" variant="primary" onClick={goToNextStep}>
                    Continue
                  </Button>
                ) : null}
              </div>
              {currentStep === 5 ? (
                <Button type="submit" variant="primary" loading={publishing}>
                  Publish job
                </Button>
              ) : null}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
