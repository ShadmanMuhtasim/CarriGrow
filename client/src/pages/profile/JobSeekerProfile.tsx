import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/form/Textarea";
import DatePicker from "../../components/form/DatePicker";
import Select from "../../components/form/Select";
import FileUpload from "../../components/FileUpload";
import SkillSelector from "../../components/SkillSelector";
import Tabs from "../../components/Tabs";
import Loading from "../../components/Loading";
import { deleteMyProfile, getMe, setMySkills, updateMe, type SkillAssignment } from "../../services/user";
import { listSkills } from "../../services/skills";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { arrayToLines, completionPercent, linesToArray } from "./profileUtils";
import type { Skill, User } from "../../types/models";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
  bio: z.string().max(2000).optional(),
  education_text: z.string().optional(),
  experience_text: z.string().optional(),
  resume_url: z.union([z.literal(""), z.string().url("Resume URL must be valid")]),
  portfolio_url: z.union([z.literal(""), z.string().url("Portfolio URL must be valid")]),
  linkedin_url: z.union([z.literal(""), z.string().url("LinkedIn URL must be valid")]),
  github_url: z.union([z.literal(""), z.string().url("GitHub URL must be valid")]),
  date_of_birth: z.string().optional(),
  gender: z.enum(["", "male", "female", "other", "prefer_not_to_say"]),
});

type FormValues = z.infer<typeof schema>;

function mapSkillAssignments(user: User | null): SkillAssignment[] {
  if (!user) {
    return [];
  }
  return (user.skills ?? []).map((skill) => ({
    skill_id: skill.id,
    proficiency_level: skill.pivot?.proficiency_level ?? "beginner",
  }));
}

export default function JobSeekerProfile() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillAssignment[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      bio: "",
      education_text: "",
      experience_text: "",
      resume_url: "",
      portfolio_url: "",
      linkedin_url: "",
      github_url: "",
      date_of_birth: "",
      gender: "",
    },
  });

  function applyFormFromUser(user: User) {
    const profile = user.job_seeker_profile ?? user.jobSeekerProfile ?? {};

    setValue("name", user.name ?? "");
    setValue("phone", profile.phone ?? "");
    setValue("location", profile.location ?? "");
    setValue("bio", profile.bio ?? "");
    setValue("education_text", arrayToLines(profile.education ?? []));
    setValue("experience_text", arrayToLines(profile.experience ?? []));
    setValue("resume_url", profile.resume_url ?? "");
    setValue("portfolio_url", profile.portfolio_url ?? "");
    setValue("linkedin_url", profile.linkedin_url ?? "");
    setValue("github_url", profile.github_url ?? "");
    setValue("date_of_birth", profile.date_of_birth ?? "");
    setValue("gender", profile.gender ?? "");
    setSelectedSkills(mapSkillAssignments(user));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meResponse, skillsResponse] = await Promise.all([getMe(), listSkills()]);
        if (cancelled) {
          return;
        }

        const user = meResponse.user;
        applyFormFromUser(user);

        setAllSkills(skillsResponse.skills ?? []);
      } catch {
        toastUI.error("Failed to load profile");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const watched = watch();
  const progress = useMemo(() => {
    return completionPercent([
      watched.name,
      watched.phone,
      watched.location,
      watched.bio,
      watched.resume_url,
      watched.portfolio_url,
      watched.linkedin_url,
      watched.github_url,
      watched.date_of_birth,
      watched.education_text,
      watched.experience_text,
      watched.gender,
    ]);
  }, [watched]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const response = await updateMe({
        name: values.name,
        phone: values.phone || null,
        location: values.location || null,
        bio: values.bio || null,
        education: linesToArray(values.education_text ?? ""),
        experience: linesToArray(values.experience_text ?? ""),
        resume_url: values.resume_url || null,
        portfolio_url: values.portfolio_url || null,
        linkedin_url: values.linkedin_url || null,
        github_url: values.github_url || null,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
      });
      setUser(response.user);
      toastUI.success("Profile details updated");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to save profile details");
    } finally {
      setSaving(false);
    }
  }

  async function saveSkills() {
    if (selectedSkills.length === 0) {
      toastUI.error("Select at least one skill");
      return;
    }

    setSkillsSaving(true);
    try {
      const response = await setMySkills(selectedSkills);
      const meResponse = await getMe();
      setUser(meResponse.user);
      setSelectedSkills(
        response.skills.map((skill) => ({
          skill_id: skill.id,
          proficiency_level: skill.pivot?.proficiency_level ?? "beginner",
        }))
      );
      toastUI.success("Skills updated");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to update skills");
    } finally {
      setSkillsSaving(false);
    }
  }

  async function handleDeleteProfile() {
    setDeletingProfile(true);
    try {
      const response = await deleteMyProfile();
      setUser(response.user);
      applyFormFromUser(response.user);
      setActiveTab("details");
      toastUI.success("Profile data deleted");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to delete profile data");
    } finally {
      setDeletingProfile(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <Loading label="Loading job seeker profile..." />;
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        <Card
          title="Job Seeker Profile"
          subtitle="Complete your profile to improve job matching and mentorship visibility."
          actions={<Badge variant="primary">{progress}% complete</Badge>}
        >
          <div className="progress" role="progressbar" aria-label="Profile completion">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card>
          <Tabs
            tabs={[
              { id: "details", label: "Profile Details" },
              { id: "skills", label: "Skills" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "details" ? (
            <>
              <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="col-12 col-md-6">
                  <Input label="Name" error={errors.name?.message} {...register("name")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Location" error={errors.location?.message} {...register("location")} />
                </div>
                <div className="col-12 col-md-6">
                  <Select
                    label="Gender"
                    error={errors.gender?.message}
                    options={[
                      { value: "", label: "Select gender" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                      { value: "prefer_not_to_say", label: "Prefer not to say" },
                    ]}
                    {...register("gender")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <DatePicker label="Date of Birth" error={errors.date_of_birth?.message} {...register("date_of_birth")} />
                </div>
                <div className="col-12">
                  <Textarea label="Bio" rows={3} error={errors.bio?.message} {...register("bio")} />
                </div>
                <div className="col-12 col-md-6">
                  <Textarea
                    label="Education (one item per line)"
                    rows={4}
                    error={errors.education_text?.message}
                    {...register("education_text")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Textarea
                    label="Experience (one item per line)"
                    rows={4}
                    error={errors.experience_text?.message}
                    {...register("experience_text")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FileUpload
                    label="Resume"
                    acceptedTypes=".pdf,.doc,.docx"
                    existingUrl={watch("resume_url")}
                    onUrlChange={(url) => setValue("resume_url", url)}
                    helpText="Select a file for local preview or provide a public URL for API save."
                  />
                  {errors.resume_url?.message ? <div className="invalid-feedback d-block">{errors.resume_url.message}</div> : null}
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Portfolio URL" error={errors.portfolio_url?.message} {...register("portfolio_url")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="LinkedIn URL" error={errors.linkedin_url?.message} {...register("linkedin_url")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="GitHub URL" error={errors.github_url?.message} {...register("github_url")} />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2">
                  <Button type="submit" loading={saving}>
                    Save Profile
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setConfirmOpen(true)}
                    disabled={saving || deletingProfile}
                  >
                    Delete Profile Data
                  </Button>
                </div>
              </form>

              <Modal
                open={confirmOpen}
                title="Delete Profile Data"
                onClose={() => !deletingProfile && setConfirmOpen(false)}
                footer={
                  <>
                    <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={deletingProfile}>
                      Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={handleDeleteProfile} loading={deletingProfile}>
                      Delete
                    </Button>
                  </>
                }
              >
                <p className="mb-0">
                  This will remove your job seeker profile details (bio, links, education, experience). Your user account stays active.
                </p>
              </Modal>
            </>
          ) : (
            <div className="vstack gap-3">
              <p className="text-muted mb-0">Choose skills and set your proficiency level.</p>
              <SkillSelector allSkills={allSkills} value={selectedSkills} onChange={setSelectedSkills} />
              <div>
                <Button loading={skillsSaving} onClick={saveSkills}>
                  Save Skills
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
