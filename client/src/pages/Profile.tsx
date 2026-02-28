import { useEffect, useMemo, useState } from "react";
import { getMe, updateMe, setMySkills } from "../services/user";
import { listSkills } from "../services/skills";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  const [form, setForm] = useState<any>({
    name: "",
    bio: "",
    education: "",
    experience: "",
    portfolio_url: "",
    linkedin_url: "",
    company_name: "",
    company_website: "",
    company_description: "",
    company_location: "",
    headline: "",
    expertise: "",
  });

  const role = user?.role;

  const roleFields = useMemo(() => {
    if (role === "job_seeker") return ["bio", "education", "experience", "portfolio_url", "linkedin_url"];
    if (role === "employer") return ["company_name", "company_website", "company_description", "company_location"];
    if (role === "mentor") return ["headline", "bio", "expertise"];
    return [];
  }, [role]);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, skillsRes] = await Promise.all([getMe(), listSkills()]);
        const u = meRes.user;
        setUser(u);
        setAllSkills(skillsRes.skills ?? []);
        setSelectedSkillIds((u.skills ?? []).map((s: any) => s.id));

        setForm((prev: any) => ({
          ...prev,
          name: u.name ?? "",
          ...(u.job_seeker_profile ?? u.jobSeekerProfile ?? {}),
          ...(u.employer_profile ?? u.employerProfile ?? {}),
          ...(u.mentor_profile ?? u.mentorProfile ?? {}),
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSkill = (id: number) => {
    setSelectedSkillIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await updateMe({
        name: form.name,
        ...Object.fromEntries(roleFields.map((k) => [k, form[k]])),
      });

      await setMySkills(selectedSkillIds);

      const refreshed = await getMe();
      setUser(refreshed.user);
      alert("Profile saved!");
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted">Loading...</div>;

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h4 fw-bold mb-1">Profile</h2>
            <div className="text-muted mb-3">Update your details and skill tags.</div>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              {role === "job_seeker" && (
                <>
                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Education</label>
                    <input className="form-control" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Experience</label>
                    <input className="form-control" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Portfolio URL</label>
                    <input className="form-control" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">LinkedIn URL</label>
                    <input className="form-control" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
                  </div>
                </>
              )}

              {role === "employer" && (
                <>
                  <div className="col-12">
                    <label className="form-label">Company Name</label>
                    <input className="form-control" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Company Website</label>
                    <input className="form-control" value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Company Location</label>
                    <input className="form-control" value={form.company_location} onChange={(e) => setForm({ ...form, company_location: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Company Description</label>
                    <textarea className="form-control" rows={3} value={form.company_description} onChange={(e) => setForm({ ...form, company_description: e.target.value })} />
                  </div>
                </>
              )}

              {role === "mentor" && (
                <>
                  <div className="col-12">
                    <label className="form-label">Headline</label>
                    <input className="form-control" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Expertise</label>
                    <textarea className="form-control" rows={3} value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
                  </div>
                </>
              )}

              <div className="col-12">
                <button className="btn btn-primary" disabled={saving} onClick={onSave}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h3 className="h5 fw-bold">Skills</h3>
            <div className="text-muted small mb-2">Select the skills you have.</div>

            <div className="skill-list">
              {allSkills.map((s) => {
                const active = selectedSkillIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`skill-pill ${active ? "active" : ""}`}
                    onClick={() => toggleSkill(s.id)}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            <div className="text-muted small mt-3">
              Selected: <b>{selectedSkillIds.length}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}