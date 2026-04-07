import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import RichTextEditor from "../../components/forum/RichTextEditor";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { createForumPost } from "../../services/forum";
import { listSkills } from "../../services/skills";
import type { ForumPostType, Skill } from "../../types/models";

const postTypes: ForumPostType[] = ["question", "discussion", "resource"];

function formatType(value: ForumPostType): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function NewPost() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ForumPostType>("question");
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
          setSkills([]);
        }
      }
    }

    void loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => {
    const cleanContent = content.replace(/<[^>]*>/g, " ").trim();
    return Boolean(user && title.trim().length >= 8 && cleanContent.length >= 20);
  }, [content, title, user]);

  function toggleSkill(skillId: number) {
    setSelectedSkillIds((current) => {
      if (current.includes(skillId)) {
        return current.filter((id) => id !== skillId);
      }

      if (current.length >= 5) {
        toastUI.info("You can tag up to 5 skills.");
        return current;
      }

      return [...current, skillId];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      toastUI.error("Sign in to create a post.");
      navigate("/login");
      return;
    }

    if (!canSubmit) {
      toastUI.error("Please complete title and content before publishing.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await createForumPost({
        title: title.trim(),
        content,
        type,
        skill_ids: selectedSkillIds,
      });

      toastUI.success("Post published.");
      navigate(`/forum/${response.post.id}`);
    } catch {
      toastUI.error("Could not publish this post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Forum", to: "/forum" }, { label: "New Post" }]} />

        <Card title="Create New Post" subtitle="Issue #31 form: title, rich text editor, skill selector, and post type.">
          {!user ? (
            <div className="alert alert-warning d-flex align-items-center justify-content-between mb-0">
              <span>Please sign in to create a forum post.</span>
              <Link to="/login" className="btn btn-sm btn-primary">Sign in</Link>
            </div>
          ) : (
            <form className="vstack gap-3" onSubmit={handleSubmit}>
              <Input
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: How to improve backend portfolio for entry-level jobs?"
              />

              <div>
                <label className="form-label">Post type</label>
                <select className="form-select" value={type} onChange={(event) => setType(event.target.value as ForumPostType)}>
                  {postTypes.map((postType) => (
                    <option key={postType} value={postType}>
                      {formatType(postType)}
                    </option>
                  ))}
                </select>
              </div>

              <RichTextEditor
                label="Body"
                value={content}
                onChange={setContent}
                placeholder="Describe your question or share useful context so others can help effectively."
                minHeight={220}
              />

              <div>
                <label className="form-label">Skill selector</label>
                <div className="d-flex flex-wrap gap-2 border rounded-3 p-3">
                  {skills.length === 0 ? (
                    <span className="text-muted small">No skills available yet.</span>
                  ) : (
                    skills.map((skill) => {
                      const isActive = selectedSkillIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => toggleSkill(skill.id)}
                        >
                          {skill.name}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="text-muted small mt-2">Selected: {selectedSkillIds.length} / 5</div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Link to="/forum">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" variant="primary" loading={submitting} disabled={!canSubmit}>
                  Publish post
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
