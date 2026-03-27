import { z } from "zod";

export const employmentTypeOptions = [
  { value: "", label: "Select employment type" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
] as const;

export const experienceLevelOptions = [
  { value: "", label: "Select experience level" },
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
] as const;

export const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "BDT", label: "BDT" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
] as const;

export const jobFormSchema = z
  .object({
    title: z.string().min(3, "Job title is required"),
    location: z.string().min(2, "Location is required"),
    employment_type: z.enum(["full_time", "part_time", "contract", "internship"], {
      message: "Employment type is required",
    }),
    experience_level: z.enum(["entry", "mid", "senior", "lead"], {
      message: "Experience level is required",
    }),
    description: z.string().min(50, "Description should be at least 50 characters"),
    requirements: z.string().min(20, "Requirements should be at least 20 characters"),
    responsibilities: z.string().min(20, "Responsibilities should be at least 20 characters"),
    salary_min: z.string().min(1, "Minimum salary is required"),
    salary_max: z.string().min(1, "Maximum salary is required"),
    salary_currency: z.string().min(1, "Currency is required"),
    benefits: z.string().optional(),
    education_required: z.string().min(2, "Education requirement is required"),
    application_deadline: z.string().min(1, "Application deadline is required"),
  })
  .refine((values: JobFormValues) => Number(values.salary_min) >= 0, {
    message: "Minimum salary must be 0 or more",
    path: ["salary_min"],
  })
  .refine((values: JobFormValues) => Number(values.salary_max) >= Number(values.salary_min), {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salary_max"],
  });

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const defaultJobFormValues: JobFormValues = {
  title: "",
  location: "",
  employment_type: "full_time",
  experience_level: "entry",
  description: "",
  requirements: "",
  responsibilities: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
  benefits: "",
  education_required: "",
  application_deadline: "",
};

export const stepFields: Record<number, Array<keyof JobFormValues>> = {
  1: ["title", "location", "employment_type", "experience_level"],
  2: ["description", "requirements", "responsibilities"],
  3: ["salary_min", "salary_max", "salary_currency", "benefits"],
  4: ["education_required", "application_deadline"],
  5: [],
};

export const jobDraftStorageKey = "carrigrow.employer.job-post.draft";
