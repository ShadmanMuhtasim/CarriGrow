import Badge from "../ui/Badge";
import Card from "../ui/Card";
import type { Skill } from "../../types/models";
import type { JobFormValues } from "./jobFormSchema";
import type { SkillAssignment } from "../../services/user";

type JobPreviewProps = {
  values: JobFormValues;
  skills: SkillAssignment[];
  allSkills: Skill[];
};

function resolveSkillNames(skills: SkillAssignment[], allSkills: Skill[]): string[] {
  return skills.map((item) => allSkills.find((skill) => skill.id === item.skill_id)?.name ?? `Skill #${item.skill_id}`);
}

export default function JobPreview({ values, skills, allSkills }: JobPreviewProps) {
  const skillNames = resolveSkillNames(skills, allSkills);

  return (
    <div className="vstack gap-3">
      <Card
        title={values.title || "Untitled Job"}
        subtitle={`${values.location || "Location TBD"} • ${values.employment_type.replace("_", " ")}`}
        actions={<Badge variant="primary">{values.experience_level}</Badge>}
      >
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <h3 className="h6">Description</h3>
            <p className="mb-0 white-space-pre-line">{values.description || "No description yet."}</p>
          </div>
          <div className="col-12 col-lg-4">
            <div className="border rounded-3 p-3 bg-light">
              <div className="small text-muted">Compensation</div>
              <div className="fw-semibold">
                {values.salary_currency} {values.salary_min || "0"} - {values.salary_max || "0"}
              </div>
              <div className="small text-muted mt-3">Deadline</div>
              <div>{values.application_deadline || "Not set"}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <Card title="Requirements">
            <p className="mb-0 white-space-pre-line">{values.requirements || "No requirements yet."}</p>
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title="Responsibilities">
            <p className="mb-0 white-space-pre-line">{values.responsibilities || "No responsibilities yet."}</p>
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title="Benefits">
            <p className="mb-0 white-space-pre-line">{values.benefits || "Benefits not added yet."}</p>
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title="Skills & Qualifications">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {skillNames.length > 0 ? skillNames.map((name) => <Badge key={name}>{name}</Badge>) : <span className="text-muted">No skills selected yet.</span>}
            </div>
            <div className="small text-muted">Education</div>
            <div>{values.education_required || "Not specified"}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
