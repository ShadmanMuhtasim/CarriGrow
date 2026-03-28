import { api } from "./api";
import type { Job } from "../types/models";

export type JobPayload = {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  employment_type: Job["employment_type"];
  experience_level: Job["experience_level"];
  education_required: string;
  skills_required: string[];
  application_deadline: string;
  status: Job["status"];
};

type JobExperienceFilter = Exclude<Job["experience_level"], null | undefined>;

export type JobBrowseParams = {
  page?: number;
  per_page?: 10 | 25 | 50;
  search?: string;
  location?: string;
  employment_type?: Job["employment_type"];
  experience_level?: JobExperienceFilter;
  salary_min?: number;
  salary_max?: number;
  skill_ids?: number[];
  posted_within_days?: number;
  sort?: "newest" | "salary" | "relevance";
};

export type JobBrowseResponse = {
  jobs: Job[];
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
};

export type JobApplicationStatus = "applied" | "under_review" | "shortlisted" | "rejected" | "hired";

export type JobApplyPayload = {
  cover_letter?: string;
  resume_url: string;
  additional_documents?: string[];
};

export type JobApplication = {
  id: number;
  job_id: number;
  user_id: number;
  cover_letter?: string | null;
  resume_url: string;
  additional_documents?: string[] | null;
  status: JobApplicationStatus;
  employer_notes?: string | null;
  applied_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
  job?: Job;
};

export type JobApplicationListParams = {
  status?: JobApplicationStatus;
  per_page?: 10 | 25 | 50;
};

export type JobApplicationsResponse = {
  applications: JobApplication[];
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeJobsListPayload(payload: unknown): JobBrowseResponse {
  if (isObject(payload) && Array.isArray(payload.data)) {
    return {
      jobs: payload.data as Job[],
      page: Math.max(1, toNumber(payload.current_page, 1)),
      totalPages: Math.max(1, toNumber(payload.last_page, 1)),
      perPage: Math.max(1, toNumber(payload.per_page, payload.data.length || 10)),
      total: Math.max(0, toNumber(payload.total, payload.data.length)),
    };
  }

  if (isObject(payload) && Array.isArray(payload.jobs)) {
    const jobs = payload.jobs as Job[];
    return {
      jobs,
      page: 1,
      totalPages: 1,
      perPage: jobs.length || 10,
      total: jobs.length,
    };
  }

  return {
    jobs: [],
    page: 1,
    totalPages: 1,
    perPage: 10,
    total: 0,
  };
}

function normalizeJobDetailPayload(payload: unknown): Job {
  if (isObject(payload) && "job" in payload && isObject(payload.job)) {
    return payload.job as Job;
  }

  throw new Error("Invalid job detail response.");
}

function normalizeApplicationsListPayload(payload: unknown): JobApplicationsResponse {
  if (isObject(payload) && Array.isArray(payload.data)) {
    return {
      applications: payload.data as JobApplication[],
      page: Math.max(1, toNumber(payload.current_page, 1)),
      totalPages: Math.max(1, toNumber(payload.last_page, 1)),
      perPage: Math.max(1, toNumber(payload.per_page, payload.data.length || 10)),
      total: Math.max(0, toNumber(payload.total, payload.data.length)),
    };
  }

  if (isObject(payload) && "applications" in payload && isObject(payload.applications) && Array.isArray(payload.applications.data)) {
    return {
      applications: payload.applications.data as JobApplication[],
      page: Math.max(1, toNumber(payload.applications.current_page, 1)),
      totalPages: Math.max(1, toNumber(payload.applications.last_page, 1)),
      perPage: Math.max(1, toNumber(payload.applications.per_page, payload.applications.data.length || 10)),
      total: Math.max(0, toNumber(payload.applications.total, payload.applications.data.length)),
    };
  }

  return {
    applications: [],
    page: 1,
    totalPages: 1,
    perPage: 10,
    total: 0,
  };
}

export async function browsePublicJobs(params: JobBrowseParams = {}) {
  const { data } = await api.get("/jobs", { params });
  return normalizeJobsListPayload(data);
}

export async function listEmployerJobs() {
  const { data } = await api.get("/employer/jobs");
  return data as { jobs: Job[] };
}

export async function listPublicJobs() {
  const response = await browsePublicJobs({ per_page: 50 });
  return { jobs: response.jobs };
}

export async function getPublicJob(jobId: number) {
  const { data } = await api.get(`/jobs/${jobId}`);
  return { job: normalizeJobDetailPayload(data) };
}

export async function getEmployerJob(jobId: number) {
  const { data } = await api.get(`/employer/jobs/${jobId}`);
  return data as { job: Job };
}

export async function createEmployerJob(payload: JobPayload) {
  const { data } = await api.post("/employer/jobs", payload);
  return data as { message: string; job: Job };
}

export async function updateEmployerJob(jobId: number, payload: Partial<JobPayload>) {
  const { data } = await api.patch(`/employer/jobs/${jobId}`, payload);
  return data as { message: string; job: Job };
}

export async function deleteEmployerJob(jobId: number) {
  const { data } = await api.delete(`/employer/jobs/${jobId}`);
  return data as { message: string };
}

export async function applyToJob(jobId: number, payload: JobApplyPayload) {
  const { data } = await api.post(`/jobs/${jobId}/apply`, payload);
  return data as { message: string; application: JobApplication };
}

export async function listMyApplications(params: JobApplicationListParams = {}) {
  const { data } = await api.get("/applications", { params });
  return normalizeApplicationsListPayload(data);
}
