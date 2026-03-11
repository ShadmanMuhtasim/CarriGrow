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
import Select from "../../components/form/Select";
import FileUpload from "../../components/FileUpload";
import SkillSelector from "../../components/SkillSelector";
import Tabs from "../../components/Tabs";
import Loading from "../../components/Loading";
import { deleteMyProfile, getMe, setMySkills, updateMe, type SkillAssignment } from "../../services/user";
import { listSkills } from "../../services/skills";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { completionPercent } from "./profileUtils";
import type { Skill, User } from "../../types/models";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().min(2, "Company name is required"),
  company_website: z.union([z.literal(""), z.string().url("Company website must be valid")]),
  company_logo_url: z.union([z.literal(""), z.string().url("Logo URL must be valid")]),
  company_description: z.string().max(2000).optional(),
  industry: z.string().max(255).optional(),
  company_size: z.enum(["", "1-10", "11-50", "51-200", "201-500", "500+"]),
  founded_year: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }
      if (!/^\d{4}$/.test(value)) {
        return false;
      }
      const numeric = Number(value);
      return numeric >= 1800 && numeric <= new Date().getFullYear();
    }, "Founded year must be a valid year"),
  headquarters_location: z.string().max(255).optional(),
  contact_email: z.union([z.literal(""), z.string().email("Contact email must be valid")]),
  contact_phone: z.string().max(50).optional(),
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

export default function EmployerProfile() {
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
      company_name: "",
      company_website: "",
      company_logo_url: "",
      company_description: "",
      industry: "",
      company_size: "",
      founded_year: "",
      headquarters_location: "",
      contact_email: "",
      contact_phone: "",
    },
  });

  function applyFormFromUser(user: User) {
    const profile = user.employer_profile ?? user.employerProfile ?? {};

    setValue("name", user.name ?? "");
    setValue("company_name", profile.company_name ?? "");
    setValue("company_website", profile.company_website ?? "");
    setValue("company_logo_url", profile.company_logo_url ?? "");
    setValue("company_description", profile.company_description ?? "");
    setValue("industry", profile.industry ?? "");
    setValue("company_size", profile.company_size ?? "");
    setValue("founded_year", profile.founded_year ? String(profile.founded_year) : "");
    setValue("headquarters_location", profile.headquarters_location ?? "");
    setValue("contact_email", profile.contact_email ?? "");
    setValue("contact_phone", profile.contact_phone ?? "");
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
        toastUI.error("Failed to load company profile");
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
      watched.company_name,
      watched.company_website,
      watched.company_logo_url,
      watched.company_description,
      watched.industry,
      watched.company_size,
      watched.founded_year?.toString(),
      watched.headquarters_location,
      watched.contact_email,
      watched.contact_phone,
    ]);
  }, [watched]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const response = await updateMe({
        name: values.name,
        company_name: values.company_name,
        company_website: values.company_website || null,
        company_logo_url: values.company_logo_url || null,
        company_description: values.company_description || null,
        industry: values.industry || null,
        company_size: values.company_size || null,
        founded_year: values.founded_year ? Number(values.founded_year) : null,
        headquarters_location: values.headquarters_location || null,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
      });
      setUser(response.user);
      toastUI.success("Company profile updated");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to save company profile");
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
      toastUI.success("Company profile data deleted");
    } catch (error: unknown) {
      console.error(error);
      toastUI.error("Failed to delete company profile data");
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
    return <Loading label="Loading employer profile..." />;
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        <Card
          title="Employer Profile"
          subtitle="Complete your company profile to attract better candidates."
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
              { id: "details", label: "Company Details" },
              { id: "skills", label: "Skills Needed" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "details" ? (
            <>
              <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="col-12 col-md-6">
                  <Input label="Account Name" error={errors.name?.message} {...register("name")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Company Name" error={errors.company_name?.message} {...register("company_name")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Company Website" error={errors.company_website?.message} {...register("company_website")} />
                </div>
                <div className="col-12 col-md-6">
                  <Select
                    label="Company Size"
                    error={errors.company_size?.message}
                    options={[
                      { value: "", label: "Select size" },
                      { value: "1-10", label: "1-10" },
                      { value: "11-50", label: "11-50" },
                      { value: "51-200", label: "51-200" },
                      { value: "201-500", label: "201-500" },
                      { value: "500+", label: "500+" },
                    ]}
                    {...register("company_size")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Industry" error={errors.industry?.message} {...register("industry")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input type="number" label="Founded Year" error={errors.founded_year?.message} {...register("founded_year")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input
                    label="Headquarters Location"
                    error={errors.headquarters_location?.message}
                    {...register("headquarters_location")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Contact Email" error={errors.contact_email?.message} {...register("contact_email")} />
                </div>
                <div className="col-12 col-md-6">
                  <Input label="Contact Phone" error={errors.contact_phone?.message} {...register("contact_phone")} />
                </div>
                <div className="col-12 col-md-6">
                  <FileUpload
                    label="Company Logo"
                    acceptedTypes="image/*"
                    existingUrl={watch("company_logo_url")}
                    onUrlChange={(url) => setValue("company_logo_url", url)}
                    helpText="Select an image for preview or provide a public logo URL for API save."
                  />
                  {errors.company_logo_url?.message ? <div className="invalid-feedback d-block">{errors.company_logo_url.message}</div> : null}
                </div>
                <div className="col-12">
                  <Textarea
                    label="Company Description"
                    rows={4}
                    error={errors.company_description?.message}
                    {...register("company_description")}
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2">
                  <Button type="submit" loading={saving}>
                    Save Company Profile
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
                title="Delete Company Profile Data"
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
                  This will remove your employer profile details (company info, logo, contacts). Your user account stays active.
                </p>
              </Modal>
            </>
          ) : (
            <div className="vstack gap-3">
              <p className="text-muted mb-0">Select skills relevant for your hiring profile.</p>
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
