import type { Job, Skill } from "../../types/models";

export type JobMatchResult = {
  percentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedSkills: string[];
};

const fallbackSuggestions = [
  "Communication",
  "Problem Solving",
  "System Design",
  "SQL",
  "Testing",
];

export function calculateJobMatch(job: Job, userSkills: Skill[]): JobMatchResult {
  const normalizedUserSkills = userSkills.map((skill) => skill.name.trim().toLowerCase());
  const requiredSkills = (job.skills_required ?? []).map((skill) => skill.trim());

  if (requiredSkills.length === 0) {
    return {
      percentage: 100,
      matchedSkills: [],
      missingSkills: [],
      suggestedSkills: fallbackSuggestions.slice(0, 3),
    };
  }

  const matchedSkills = requiredSkills.filter((skill) => normalizedUserSkills.includes(skill.toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !normalizedUserSkills.includes(skill.toLowerCase()));
  const percentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    percentage,
    matchedSkills,
    missingSkills,
    suggestedSkills: [...new Set([...missingSkills, ...fallbackSuggestions])].slice(0, 4),
  };
}
