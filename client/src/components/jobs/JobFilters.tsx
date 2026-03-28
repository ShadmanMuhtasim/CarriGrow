import type { ChangeEvent } from "react";
import Button from "../ui/Button";
import Select from "../form/Select";
import type { JobEmploymentType, JobExperienceLevel, Skill } from "../../types/models";

const employmentTypeOptions: Array<{ value: JobEmploymentType; label: string }> = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

type SortBy = "newest" | "salary" | "relevance";
type PostedWithinDays = "" | "1" | "7" | "30";
type PerPage = 10 | 25 | 50;

export type JobFiltersValue = {
  location: string;
  employmentTypes: JobEmploymentType[];
  experienceLevel: "" | JobExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  skillIds: number[];
  postedWithinDays: PostedWithinDays;
  sortBy: SortBy;
  perPage: PerPage;
};

type JobFiltersProps = {
  values: JobFiltersValue;
  skills: Skill[];
  onChange: (next: JobFiltersValue) => void;
  onReset: () => void;
};

export default function JobFilters({ values, skills, onChange, onReset }: JobFiltersProps) {
  function update(patch: Partial<JobFiltersValue>) {
    onChange({ ...values, ...patch });
  }

  function handleSkillSelection(event: ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(event.target.selectedOptions)
      .map((option) => Number(option.value))
      .filter((id) => !Number.isNaN(id));

    update({ skillIds: selected });
  }

  return (
    <div className="border rounded-3 p-3 h-100 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h6 mb-0">Filters</h3>
        <Button type="button" variant="outline" className="btn-sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="vstack gap-3">
        <div>
          <label className="form-label">Location</label>
          <input
            className="form-control"
            placeholder="Dhaka, Remote, etc."
            value={values.location}
            onChange={(event) => update({ location: event.target.value })}
          />
        </div>

        <div>
          <label className="form-label d-block">Job type</label>
          <div className="d-flex flex-column gap-2">
            {employmentTypeOptions.map((option) => {
              const checked = values.employmentTypes.includes(option.value);
              return (
                <label key={option.value} className="form-check mb-0">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={checked}
                    onChange={(event) => {
                      const nextEmploymentTypes = event.target.checked
                        ? [...values.employmentTypes, option.value]
                        : values.employmentTypes.filter((type) => type !== option.value);
                      update({ employmentTypes: nextEmploymentTypes });
                    }}
                  />
                  <span className="form-check-label">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <Select
          label="Experience level"
          value={values.experienceLevel}
          options={[
            { value: "", label: "All levels" },
            { value: "entry", label: "Entry" },
            { value: "mid", label: "Mid" },
            { value: "senior", label: "Senior" },
            { value: "lead", label: "Lead" },
          ]}
          onChange={(event) => update({ experienceLevel: event.target.value as JobFiltersValue["experienceLevel"] })}
        />

        <div>
          <label className="form-label mb-1">Salary range</label>
          <div className="small text-muted mb-2">
            BDT {values.salaryMin.toLocaleString()} - BDT {values.salaryMax.toLocaleString()}
          </div>
          <div className="vstack gap-2">
            <input
              type="range"
              min={0}
              max={300000}
              step={5000}
              value={values.salaryMin}
              onChange={(event) => {
                const nextMin = Number(event.target.value);
                update({ salaryMin: nextMin, salaryMax: Math.max(nextMin, values.salaryMax) });
              }}
            />
            <input
              type="range"
              min={0}
              max={300000}
              step={5000}
              value={values.salaryMax}
              onChange={(event) => {
                const nextMax = Number(event.target.value);
                update({ salaryMin: Math.min(values.salaryMin, nextMax), salaryMax: nextMax });
              }}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Skills</label>
          <select
            className="form-select"
            size={Math.min(6, Math.max(3, skills.length))}
            multiple
            value={values.skillIds.map((id) => String(id))}
            onChange={handleSkillSelection}
          >
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
          <div className="form-text">Use Ctrl/Cmd to select multiple skills.</div>
        </div>

        <Select
          label="Date posted"
          value={values.postedWithinDays}
          options={[
            { value: "", label: "Any time" },
            { value: "1", label: "Last 24 hours" },
            { value: "7", label: "Last 7 days" },
            { value: "30", label: "Last 30 days" },
          ]}
          onChange={(event) => update({ postedWithinDays: event.target.value as PostedWithinDays })}
        />

        <Select
          label="Sort"
          value={values.sortBy}
          options={[
            { value: "newest", label: "Newest" },
            { value: "salary", label: "Salary" },
            { value: "relevance", label: "Relevance" },
          ]}
          onChange={(event) => update({ sortBy: event.target.value as SortBy })}
        />

        <Select
          label="Per page"
          value={String(values.perPage)}
          options={[
            { value: "10", label: "10 jobs" },
            { value: "25", label: "25 jobs" },
            { value: "50", label: "50 jobs" },
          ]}
          onChange={(event) => update({ perPage: Number(event.target.value) as PerPage })}
        />
      </div>
    </div>
  );
}
