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
  current_position: z.string().max(255).optional(),
  company: z.string().max(255).optional(),
  years_of_experience: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }
      if (!/^\d+$/.test(value)) {
        return false;
      }
      const numeric = Number(value);
      return numeric >= 0 && numeric <= 80;
    }, "Years of experience must be between 0 and 80"),
  expertise_areas_text: z.string().optional(),
  bio: z.string().max(2000).optional(),
  linkedin_url: z.union([z.literal(""), z.string().url("LinkedIn URL must be valid")]),
  calendly_link: z.union([z.literal(""), z.string().url("Calendly URL must be valid")]),
  availability_text: z.string().optional(),
  mentorship_areas_text: z.string().optional(),
  hourly_rate: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }
      const numeric = Number(value);
      return Number.isFinite(numeric) && numeric >= 0;
    }, "Hourly rate must be a positive number"),
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

export default function MentorProfile() {
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
      current_position: "",
      company: "",
      years_of_experience: "",
      expertise_areas_text: "",
      bio: "",
      linkedin_url: "",
      calendly_link: "",
      availability_text: "",
      mentorship_areas_text: "",
      hourly_rate: "",
    },
  });

  function applyFormFromUser(user: User) {
    const profile = user.mentor_profile ?? user.mentorProfile ?? {};

    setValue("name", user.name ?? "");
    setValue("current_position", profile.current_position ?? "");
    setValue("company", profile.company ?? "");
    setValue("years_of_experience", profile.years_of_experience ? String(profile.years_of_experience) : "");
    setValue("expertise_areas_text", arrayToLines(profile.expertise_areas ?? []));
    setValue("bio", profile.bio ?? "");
    setValue("linkedin_url", profile.linkedin_url ?? "");
    setValue("calendly_link", profile.calendly_link ?? "");
    setValue("availability_text", arrayToLines(profile.availability ?? []));
    setValue("mentorship_areas_text", arrayToLines(profile.mentorship_areas ?? []));
    setValue("hourly_rate", profile.hourly_rate ? String(profile.hourly_rate) : "");
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
        toastUI.error("Failed to load mentor profile");
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
      watched.current_position,
      watched.company,
      watched.years_of_experience?.toString(),
      watched.expertise_areas_text,
      watched.bio,
      watched.linkedin_url,
      watched.calendly_link,
      watched.availability_text,
      watched.mentorship_areas_text,
      watched.hourly_rate?.toString(),
    ]);
  }, [watched]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const response = await updateMe({
        name: values.name,
        current_position: values.current_position || null,
        company: values.company || null,
        years_of_experience: values.years_of_experience ? Number(values.years_of_experience) : null,
        expertise_areas: linesToArray(values.expertise_areas_text ?? ""),
        bio: values.bio || null,
        linkedin_url: values.linkedin_url || null,
        calendly_link: values.calendly_link || null,
        availability: linesToArray(values.availability_text ?? ""),
        mentorship_areas: linesToArray(values.mentorship_areas_text ?? ""),
        hourly_rate: values.hourly_rate ? Number(values.hourly_rate) : null,
      });
      setUser(response.user);
      toastUI.success("Mentor profile updated");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to save mentor profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProfile() {
    setDeletingProfile(true);
    try {
      const response = await deleteMyProfile();
      setUser(response.user);
      applyFormFromUser(response.user);
      setActiveTab("details");
      toastUI.success("Mentor profile data deleted");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to delete mentor profile data");
    } finally {
      setDeletingProfile(false);
      setConfirmOpen(false);
    }
  }

  async function saveSkills() {
    if (selectedSkills.length === 0) {
      toastUI.error("Select at least one skill");
      return;
    }

    setSkillsSaving(true);
    try {
      await setMySkills(selectedSkills);
      const meResponse = await getMe();
      setUser(meResponse.user);
      setSelectedSkills(mapSkillAssignments(meResponse.user));
      toastUI.success("Skills updated");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to update skills");
    } finally {
      setSkillsSaving(false);
    }
  }

  if (loading) {
    return <Loading label="Loading mentor profile..." />;
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        <Card
          title="Mentor Profile"
          subtitle="Showcase your expertise and availability for mentees."
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
              { id: "details", label: "Mentor Details" },
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
                  <Input label="Current Position" error={errors.current_position?.message} {...register("current_position")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Company" error={errors.company?.message} {...register("company")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input
                    type="number"
                    label="Years of Experience"
                    error={errors.years_of_experience?.message}
                    {...register("years_of_experience")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="LinkedIn URL" error={errors.linkedin_url?.message} {...register("linkedin_url")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Calendly Link" error={errors.calendly_link?.message} {...register("calendly_link")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input type="number" label="Hourly Rate" error={errors.hourly_rate?.message} {...register("hourly_rate")} />
                </div>
                <div className="col-12">
                  <Textarea label="Bio" rows={3} error={errors.bio?.message} {...register("bio")} />
                </div>
                <div className="col-12 col-md-4">
                  <Textarea
                    label="Expertise Areas (one per line)"
                    rows={4}
                    error={errors.expertise_areas_text?.message}
                    {...register("expertise_areas_text")}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Textarea
                    label="Availability (one per line)"
                    rows={4}
                    error={errors.availability_text?.message}
                    {...register("availability_text")}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Textarea
                    label="Mentorship Areas (one per line)"
                    rows={4}
                    error={errors.mentorship_areas_text?.message}
                    {...register("mentorship_areas_text")}
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2">
                  <Button type="submit" loading={saving}>
                    Save Mentor Profile
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
                title="Delete Mentor Profile Data"
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
                  This will remove your mentor profile details (expertise, availability, links). Your user account stays active.
                </p>
              </Modal>
            </>
          ) : (
            <div className="vstack gap-3">
              <p className="text-muted mb-0">Select and manage your mentor skill tags.</p>
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
