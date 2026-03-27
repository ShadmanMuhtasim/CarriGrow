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

export async function listEmployerJobs() {
  const { data } = await api.get("/employer/jobs");
  return data as { jobs: Job[] };
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
