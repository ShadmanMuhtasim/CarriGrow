export type UserRole = "job_seeker" | "employer" | "mentor" | "admin";

export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type JobStatus = "draft" | "published" | "closed" | "filled";
export type JobEmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type JobExperienceLevel = "entry" | "mid" | "senior" | "lead";

export interface Skill {
  id: number;
  name: string;
  category?: string | null;
  pivot?: {
    proficiency_level: ProficiencyLevel;
  };
}

export interface JobSeekerProfile {
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  education?: string[] | null;
  experience?: string[] | null;
  resume_url?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  date_of_birth?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
}

export interface EmployerProfile {
  company_name?: string | null;
  company_website?: string | null;
  company_logo_url?: string | null;
  company_description?: string | null;
  industry?: string | null;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | null;
  founded_year?: number | null;
  headquarters_location?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export interface MentorProfile {
  current_position?: string | null;
  company?: string | null;
  years_of_experience?: number | null;
  expertise_areas?: string[] | null;
  bio?: string | null;
  linkedin_url?: string | null;
  calendly_link?: string | null;
  availability?: string[] | null;
  mentorship_areas?: string[] | null;
  hourly_rate?: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "banned";
  skills: Skill[];
  job_seeker_profile?: JobSeekerProfile | null;
  employer_profile?: EmployerProfile | null;
  mentor_profile?: MentorProfile | null;
  jobSeekerProfile?: JobSeekerProfile | null;
  employerProfile?: EmployerProfile | null;
  mentorProfile?: MentorProfile | null;
}

export interface Job {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  requirements?: string | null;
  responsibilities?: string | null;
  location?: string | null;
  salary_min?: number | string | null;
  salary_max?: number | string | null;
  salary_currency?: string | null;
  employment_type: JobEmploymentType;
  experience_level?: JobExperienceLevel | null;
  education_required?: string | null;
  skills_required?: string[] | null;
  application_deadline?: string | null;
  status: JobStatus;
  views_count?: number;
  applications_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
