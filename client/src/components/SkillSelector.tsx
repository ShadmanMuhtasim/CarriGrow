import { useMemo, useState } from "react";
import type { ProficiencyLevel, Skill } from "../types/models";
import type { SkillAssignment } from "../services/user";

type SkillSelectorProps = {
  allSkills: Skill[];
  value: SkillAssignment[];
  onChange: (skills: SkillAssignment[]) => void;
};

const proficiencyOptions: Array<{ value: ProficiencyLevel; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export default function SkillSelector({ allSkills, value, onChange }: SkillSelectorProps) {
  const [query, setQuery] = useState("");

  const selectedMap = useMemo(() => {
    const map = new Map<number, ProficiencyLevel>();
    value.forEach((skill) => map.set(skill.skill_id, skill.proficiency_level));
    return map;
  }, [value]);

  const filteredSkills = useMemo(() => {
    if (!query.trim()) {
      return allSkills;
    }
    const normalized = query.trim().toLowerCase();
    return allSkills.filter((skill) => {
      return skill.name.toLowerCase().includes(normalized) || (skill.category ?? "").toLowerCase().includes(normalized);
    });
  }, [allSkills, query]);

  function toggleSkill(skillId: number) {
    if (selectedMap.has(skillId)) {
      onChange(value.filter((entry) => entry.skill_id !== skillId));
      return;
    }
    onChange([
      ...value,
      {
        skill_id: skillId,
        proficiency_level: "beginner",
      },
    ]);
  }

  function setLevel(skillId: number, proficiencyLevel: ProficiencyLevel) {
    onChange(
      value.map((entry) => {
        if (entry.skill_id !== skillId) {
          return entry;
        }
        return { ...entry, proficiency_level: proficiencyLevel };
      })
    );
  }

  return (
    <div>
      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Search skills..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="border rounded-3 p-2 skill-selector-grid">
        {filteredSkills.map((skill) => {
          const selectedLevel = selectedMap.get(skill.id);
          return (
            <div key={skill.id} className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 p-2 border-bottom">
              <label className="form-check d-flex align-items-center gap-2 mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={Boolean(selectedLevel)}
                  onChange={() => toggleSkill(skill.id)}
                />
                <span>
                  {skill.name}
                  {skill.category ? <span className="text-muted small ms-2">({skill.category})</span> : null}
                </span>
              </label>

              {selectedLevel ? (
                <select
                  className="form-select form-select-sm w-auto"
                  value={selectedLevel}
                  onChange={(event) => setLevel(skill.id, event.target.value as ProficiencyLevel)}
                >
                  {proficiencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
