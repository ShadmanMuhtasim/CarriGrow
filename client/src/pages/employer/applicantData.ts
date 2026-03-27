import type { Job } from "../../types/models";
import type { ApplicationStatus } from "../../components/applications/StatusBadge";

export type ApplicantRecord = {
  id: number;
  jobId: number;
  name: string;
  photoUrl: string;
  appliedDate: string;
  status: ApplicationStatus;
  location: string;
  skills: string[];
  match: number;
  email: string;
  phone: string;
  coverLetter: string;
  resumeUrl: string;
  notes: string;
  experienceSummary: string;
};

const fallbackSkills = [
  "React",
  "TypeScript",
  "Laravel",
  "Bootstrap",
  "Communication",
  "Problem Solving",
  "MySQL",
];

const placeholderPhotos = [
  "https://i.pravatar.cc/120?img=12",
  "https://i.pravatar.cc/120?img=14",
  "https://i.pravatar.cc/120?img=23",
  "https://i.pravatar.cc/120?img=31",
  "https://i.pravatar.cc/120?img=36",
  "https://i.pravatar.cc/120?img=44",
];

const statuses: ApplicationStatus[] = ["new", "reviewing", "shortlisted", "interview", "rejected", "hired"];

export function buildApplicantsForJob(job: Job): ApplicantRecord[] {
  const count = Math.max(job.applications_count ?? 0, 4);
  const baseSkills = job.skills_required?.length ? job.skills_required : fallbackSkills;

  return Array.from({ length: count }).slice(0, 8).map((_, index) => {
    const status = statuses[index % statuses.length];
    return {
      id: index + 1,
      jobId: job.id,
      name: `Applicant ${index + 1}`,
      photoUrl: placeholderPhotos[index % placeholderPhotos.length],
      appliedDate: `2026-03-${String(10 + index).padStart(2, "0")}`,
      status,
      location: job.location ?? "Remote",
      skills: baseSkills.slice(0, Math.min(baseSkills.length, 4)),
      match: Math.max(58, 92 - index * 5),
      email: `applicant${index + 1}@example.com`,
      phone: `+880 1700 000${index + 1}`,
      coverLetter: `I am applying for ${job.title} because my background aligns with the required stack and team needs. This placeholder text can be replaced with the real application payload later.`,
      resumeUrl: "https://example.com/resume.pdf",
      notes: index === 0 ? "Strong portfolio and clear communication." : "Follow up after profile review.",
      experienceSummary: `${2 + index} years across frontend delivery, collaboration, and product iteration.`,
    };
  });
}
