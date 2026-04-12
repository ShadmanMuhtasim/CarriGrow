import type { ProficiencyLevel, Skill } from "../../types/models";

type ExpertiseBadgeProps = {
  skill: Skill;
  showLevel?: boolean;
  className?: string;
};

const proficiencyLabelMap: Record<ProficiencyLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const proficiencyTextClassMap: Record<ProficiencyLevel, string> = {
  beginner: "text-secondary",
  intermediate: "text-primary",
  advanced: "text-success",
  expert: "text-warning",
};

export default function ExpertiseBadge({ skill, showLevel = false, className = "" }: ExpertiseBadgeProps) {
  const level = skill.pivot?.proficiency_level;

  return (
    <span className={`badge rounded-pill bg-light text-dark border d-inline-flex align-items-center gap-1 ${className}`.trim()}>
      <i className="bi bi-lightning-charge-fill text-primary" aria-hidden="true" />
      <span>{skill.name}</span>
      {showLevel && level ? <span className={`small ${proficiencyTextClassMap[level]}`}>({proficiencyLabelMap[level]})</span> : null}
    </span>
  );
}
