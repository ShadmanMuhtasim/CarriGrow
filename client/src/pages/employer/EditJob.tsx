import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { toastUI } from "../../components/ui/Toast";
import type { SkillAssignment } from "../../services/user";
import { getEmployerJob } from "../../services/jobs";
import type { JobFormValues } from "../../components/jobs/jobFormSchema";
import PostJob from "./PostJob";

function skillsToAssignments(skills: string[] | null | undefined): SkillAssignment[] {
  if (!skills) {
    return [];
  }

  return skills.map((_, index) => ({
    skill_id: index + 1,
    proficiency_level: "intermediate",
  }));
}

export default function EditJob() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<Partial<JobFormValues> | null>(null);
  const [initialSkills, setInitialSkills] = useState<SkillAssignment[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        const response = await getEmployerJob(jobId);
        if (cancelled) {
          return;
        }

        setInitialValues({
          title: response.job.title,
          location: response.job.location ?? "",
          employment_type: response.job.employment_type,
          experience_level: response.job.experience_level ?? "entry",
          description: response.job.description,
          requirements: response.job.requirements ?? "",
          responsibilities: response.job.responsibilities ?? "",
          salary_min: response.job.salary_min?.toString() ?? "",
          salary_max: response.job.salary_max?.toString() ?? "",
          salary_currency: response.job.salary_currency ?? "USD",
          education_required: response.job.education_required ?? "",
          application_deadline: response.job.application_deadline ?? "",
          benefits: "",
        });
        setInitialSkills(skillsToAssignments(response.job.skills_required));
      } catch {
        toastUI.error("Could not load the job for editing.");
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

  const ready = useMemo(() => !loading && initialValues !== null, [initialValues, loading]);

  if (!ready) {
    return <Loading label="Loading job editor..." />;
  }

  return <PostJob mode="edit" initialJobId={jobId} initialValues={initialValues ?? undefined} initialSkills={initialSkills} />;
}
