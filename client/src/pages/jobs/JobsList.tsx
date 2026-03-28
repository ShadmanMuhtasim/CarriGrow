import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import JobCard from "../../components/jobs/JobCard";
import JobFilters, { type JobFiltersValue } from "../../components/jobs/JobFilters";
import SearchBar from "../../components/jobs/SearchBar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Pagination from "../../components/ui/Pagination";
import { toastUI } from "../../components/ui/Toast";
import { browsePublicJobs, type JobBrowseParams } from "../../services/jobs";
import { listSkills } from "../../services/skills";
import type { Job, JobEmploymentType, JobExperienceLevel, Skill } from "../../types/models";

const savedJobsStorageKey = "carrigrow.saved_jobs";
const salaryLimit = 300000;

const supportedEmploymentTypes: JobEmploymentType[] = ["full_time", "part_time", "contract", "internship"];
const supportedExperienceLevels: JobExperienceLevel[] = ["entry", "mid", "senior", "lead"];

const defaultFilterValues: JobFiltersValue = {
  location: "",
  employmentTypes: [],
  experienceLevel: "",
  salaryMin: 0,
  salaryMax: salaryLimit,
  skillIds: [],
  postedWithinDays: "",
  sortBy: "newest",
  perPage: 10,
};

type JobsView = "grid" | "list";

type JobsQueryState = JobFiltersValue & {
  search: string;
  page: number;
  view: JobsView;
};

const defaultQueryState: JobsQueryState = {
  ...defaultFilterValues,
  search: "",
  page: 1,
  view: "grid",
};

function clampSalary(value: number) {
  return Math.min(salaryLimit, Math.max(0, value));
}

function parsePositiveNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function parseEmploymentTypes(value: string | null): JobEmploymentType[] {
  if (!value) {
    return [];
  }

  const typeSet = new Set(value.split(",").map((item) => item.trim()).filter((item) => item.length > 0));
  return supportedEmploymentTypes.filter((type) => typeSet.has(type));
}

function parseExperienceLevel(value: string | null): JobFiltersValue["experienceLevel"] {
  if (!value) {
    return "";
  }

  if (supportedExperienceLevels.includes(value as JobExperienceLevel)) {
    return value as JobExperienceLevel;
  }

  return "";
}

function parsePostedWithinDays(value: string | null): JobFiltersValue["postedWithinDays"] {
  if (value === "1" || value === "7" || value === "30") {
    return value;
  }
  return "";
}

function parseSort(value: string | null): JobFiltersValue["sortBy"] {
  if (value === "salary" || value === "relevance") {
    return value;
  }
  return "newest";
}

function parsePerPage(value: string | null): JobFiltersValue["perPage"] {
  if (value === "25") {
    return 25;
  }
  if (value === "50") {
    return 50;
  }
  return 10;
}

function parseView(value: string | null): JobsView {
  return value === "list" ? "list" : "grid";
}

function parseSkillIds(value: string | null): number[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function parseQueryState(searchParams: URLSearchParams): JobsQueryState {
  const salaryMin = clampSalary(parsePositiveNumber(searchParams.get("salaryMin"), defaultFilterValues.salaryMin));
  const salaryMax = clampSalary(parsePositiveNumber(searchParams.get("salaryMax"), defaultFilterValues.salaryMax));

  return {
    search: searchParams.get("search")?.trim() ?? "",
    page: Math.max(1, Math.floor(parsePositiveNumber(searchParams.get("page"), 1))),
    view: parseView(searchParams.get("view")),
    location: searchParams.get("location")?.trim() ?? "",
    employmentTypes: parseEmploymentTypes(searchParams.get("types")),
    experienceLevel: parseExperienceLevel(searchParams.get("experience")),
    salaryMin: Math.min(salaryMin, salaryMax),
    salaryMax: Math.max(salaryMin, salaryMax),
    skillIds: parseSkillIds(searchParams.get("skills")),
    postedWithinDays: parsePostedWithinDays(searchParams.get("posted")),
    sortBy: parseSort(searchParams.get("sort")),
    perPage: parsePerPage(searchParams.get("perPage")),
  };
}

function toSearchParams(query: JobsQueryState) {
  const params = new URLSearchParams();

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.page > 1) {
    params.set("page", String(query.page));
  }
  if (query.view !== defaultQueryState.view) {
    params.set("view", query.view);
  }
  if (query.location.trim()) {
    params.set("location", query.location.trim());
  }
  if (query.employmentTypes.length > 0) {
    params.set("types", query.employmentTypes.join(","));
  }
  if (query.experienceLevel) {
    params.set("experience", query.experienceLevel);
  }
  if (query.salaryMin !== defaultFilterValues.salaryMin) {
    params.set("salaryMin", String(query.salaryMin));
  }
  if (query.salaryMax !== defaultFilterValues.salaryMax) {
    params.set("salaryMax", String(query.salaryMax));
  }
  if (query.skillIds.length > 0) {
    params.set("skills", query.skillIds.join(","));
  }
  if (query.postedWithinDays) {
    params.set("posted", query.postedWithinDays);
  }
  if (query.sortBy !== defaultFilterValues.sortBy) {
    params.set("sort", query.sortBy);
  }
  if (query.perPage !== defaultFilterValues.perPage) {
    params.set("perPage", String(query.perPage));
  }

  return params;
}

function loadSavedJobs() {
  try {
    const raw = window.localStorage.getItem(savedJobsStorageKey);
    if (!raw) {
      return [] as number[];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as number[];
    }

    return parsed.filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  } catch {
    return [] as number[];
  }
}

function persistSavedJobs(jobIds: number[]) {
  window.localStorage.setItem(savedJobsStorageKey, JSON.stringify(jobIds));
}

function JobsSkeleton({ view }: { view: JobsView }) {
  const columnClass = view === "grid" ? "col-12 col-lg-6" : "col-12";

  return (
    <div className="row g-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={columnClass}>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="placeholder-glow mb-3">
                <span className="placeholder col-8" />
              </div>
              <div className="placeholder-glow mb-2">
                <span className="placeholder col-5" />
              </div>
              <div className="placeholder-glow mb-2">
                <span className="placeholder col-12" />
              </div>
              <div className="placeholder-glow mb-3">
                <span className="placeholder col-10" />
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-4" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryState = useMemo(() => parseQueryState(searchParams), [searchParams]);

  const [searchDraft, setSearchDraft] = useState(queryState.search);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>(() => loadSavedJobs());

  useEffect(() => {
    setSearchDraft(queryState.search);
  }, [queryState.search]);

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      try {
        const response = await listSkills();
        if (!cancelled) {
          setSkills(response.skills);
        }
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load skills for filters.");
        }
      }
    }

    loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);

      const params: JobBrowseParams = {
        page: queryState.page,
        per_page: queryState.perPage,
        sort: queryState.sortBy,
      };

      if (queryState.search.trim()) {
        params.search = queryState.search.trim();
      }
      if (queryState.location.trim()) {
        params.location = queryState.location.trim();
      }
      if (queryState.employmentTypes.length === 1) {
        params.employment_type = queryState.employmentTypes[0];
      }
      if (queryState.experienceLevel) {
        params.experience_level = queryState.experienceLevel;
      }
      if (queryState.salaryMin > 0) {
        params.salary_min = queryState.salaryMin;
      }
      if (queryState.salaryMax < salaryLimit) {
        params.salary_max = queryState.salaryMax;
      }
      if (queryState.skillIds.length > 0) {
        params.skill_ids = queryState.skillIds;
      }
      if (queryState.postedWithinDays) {
        params.posted_within_days = Number(queryState.postedWithinDays);
      }

      try {
        const response = await browsePublicJobs(params);
        if (!cancelled) {
          setJobs(response.jobs);
          setTotalPages(response.totalPages);
          setTotalJobs(response.total);
        }
      } catch {
        if (!cancelled) {
          setJobs([]);
          setTotalPages(1);
          setTotalJobs(0);
          toastUI.error("Could not load jobs right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [queryState]);

  const visibleJobs = useMemo(() => {
    if (queryState.employmentTypes.length === 0) {
      return jobs;
    }
    return jobs.filter((job) => queryState.employmentTypes.includes(job.employment_type));
  }, [jobs, queryState.employmentTypes]);

  function updateQueryState(patch: Partial<JobsQueryState>, options?: { resetPage?: boolean }) {
    const shouldResetPage = options?.resetPage ?? true;
    const nextQueryState: JobsQueryState = {
      ...queryState,
      ...patch,
    };

    if (shouldResetPage && patch.page === undefined) {
      nextQueryState.page = 1;
    }

    setSearchParams(toSearchParams(nextQueryState), { replace: true });
  }

  function toggleSavedJob(jobId: number) {
    setSavedJobs((current) => {
      const alreadySaved = current.includes(jobId);
      const next = alreadySaved ? current.filter((id) => id !== jobId) : [...current, jobId];
      persistSavedJobs(next);
      toastUI.info(alreadySaved ? "Removed from saved jobs." : "Saved job for later.");
      return next;
    });
  }

  function resetFilters() {
    updateQueryState({
      ...defaultFilterValues,
    });
  }

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Jobs" }]} />

        <Card
          title="Job Browser"
          subtitle="Issue #19 base implementation: search, filters, list/grid view, pagination, and save-job state."
          actions={
            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-light border">Saved: {savedJobs.length}</span>
              <div className="btn-group btn-group-sm" role="group" aria-label="Card view toggle">
                <Button
                  type="button"
                  variant={queryState.view === "grid" ? "primary" : "outline"}
                  className="btn-sm"
                  onClick={() => updateQueryState({ view: "grid" }, { resetPage: false })}
                >
                  Grid
                </Button>
                <Button
                  type="button"
                  variant={queryState.view === "list" ? "primary" : "outline"}
                  className="btn-sm"
                  onClick={() => updateQueryState({ view: "list" }, { resetPage: false })}
                >
                  List
                </Button>
              </div>
            </div>
          }
        >
          <SearchBar
            value={searchDraft}
            onChange={setSearchDraft}
            onSearch={() => updateQueryState({ search: searchDraft.trim(), page: 1 }, { resetPage: false })}
            onClear={() => {
              setSearchDraft("");
              updateQueryState({ search: "", page: 1 }, { resetPage: false });
            }}
          />

          <div className="row g-3 mt-1">
            <div className="col-12 col-xl-3">
              <JobFilters
                values={{
                  location: queryState.location,
                  employmentTypes: queryState.employmentTypes,
                  experienceLevel: queryState.experienceLevel,
                  salaryMin: queryState.salaryMin,
                  salaryMax: queryState.salaryMax,
                  skillIds: queryState.skillIds,
                  postedWithinDays: queryState.postedWithinDays,
                  sortBy: queryState.sortBy,
                  perPage: queryState.perPage,
                }}
                skills={skills}
                onChange={(nextFilters) => updateQueryState({ ...nextFilters })}
                onReset={resetFilters}
              />
            </div>

            <div className="col-12 col-xl-9">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div className="text-muted small">
                  Showing {visibleJobs.length} of {totalJobs} jobs
                </div>
              </div>

              {loading ? (
                <JobsSkeleton view={queryState.view} />
              ) : visibleJobs.length === 0 ? (
                <div className="border rounded-3 p-4 text-center text-muted">No jobs found for the selected criteria.</div>
              ) : (
                <div className="row g-3">
                  {visibleJobs.map((job) => (
                    <div key={job.id} className={queryState.view === "grid" ? "col-12 col-lg-6" : "col-12"}>
                      <JobCard
                        job={job}
                        view={queryState.view}
                        isSaved={savedJobs.includes(job.id)}
                        onToggleSave={toggleSavedJob}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 d-flex justify-content-end">
                <Pagination
                  page={queryState.page}
                  totalPages={totalPages}
                  onChange={(nextPage) => updateQueryState({ page: nextPage }, { resetPage: false })}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
