import { useMemo, useRef, useState, type FormEvent } from "react";
import FileUpload from "../FileUpload";
import Textarea from "../form/Textarea";
import Button from "../ui/Button";
import Input from "../ui/Input";

type ApplicationQuestion = {
  id: string;
  question: string;
  answer: string;
};

type ApplicationFormState = {
  full_name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string;
  portfolio_links: string[];
  additional_questions: ApplicationQuestion[];
  additional_documents: string[];
};

export type ApplicationProfileDefaults = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  resumeUrl?: string | null;
  portfolioLinks?: string[];
};

export type ApplicationFormSubmitPayload = {
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_url: string;
  cover_letter: string;
  portfolio_links: string[];
  additional_questions: Array<{
    question: string;
    answer: string;
  }>;
  additional_documents: string[];
};

type ApplicationFormErrors = Partial<
  Record<
    | "full_name"
    | "email"
    | "resume_url"
    | "cover_letter"
    | "portfolio_links"
    | "additional_questions"
    | "additional_documents",
    string
  >
>;

type ApplicationFormProps = {
  profileDefaults?: ApplicationProfileDefaults;
  submitting?: boolean;
  onSubmit: (payload: ApplicationFormSubmitPayload) => Promise<void> | void;
};

const defaultCoverLetter = "<p>Hello, I am interested in this role and I would like to apply using my profile details.</p>";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeLinks(links?: string[]) {
  if (!links || links.length === 0) {
    return [""];
  }

  const filtered = links.map((item) => item.trim()).filter((item) => item.length > 0);
  return filtered.length > 0 ? filtered : [""];
}

function buildInitialState(profileDefaults?: ApplicationProfileDefaults): ApplicationFormState {
  return {
    full_name: profileDefaults?.fullName?.trim() ?? "",
    email: profileDefaults?.email?.trim() ?? "",
    phone: profileDefaults?.phone?.trim() ?? "",
    resume_url: profileDefaults?.resumeUrl?.trim() ?? "",
    cover_letter: "",
    portfolio_links: normalizeLinks(profileDefaults?.portfolioLinks),
    additional_questions: [{ id: createId(), question: "", answer: "" }],
    additional_documents: [""],
  };
}

function validateForm(values: ApplicationFormState): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};
  const coverLetterText = stripHtml(values.cover_letter);

  if (!values.full_name.trim()) {
    errors.full_name = "Full name is required.";
  }

  if (!values.email.trim() || !isValidEmail(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.resume_url.trim()) {
    errors.resume_url = "Resume URL or uploaded file is required.";
  }

  if (!coverLetterText || coverLetterText.length < 30) {
    errors.cover_letter = "Cover letter should be at least 30 characters.";
  }

  const hasInvalidPortfolioLink = values.portfolio_links.some(
    (link) => link.trim().length > 0 && !isValidUrl(link.trim())
  );
  if (hasInvalidPortfolioLink) {
    errors.portfolio_links = "Portfolio links must use http:// or https:// URLs.";
  }

  const hasInvalidDocument = values.additional_documents.some(
    (link) => link.trim().length > 0 && !isValidUrl(link.trim())
  );
  if (hasInvalidDocument) {
    errors.additional_documents = "Additional document links must be valid URLs.";
  }

  const hasPartialQuestion = values.additional_questions.some((item) => {
    const hasQuestion = item.question.trim().length > 0;
    const hasAnswer = item.answer.trim().length > 0;
    return hasQuestion !== hasAnswer;
  });
  if (hasPartialQuestion) {
    errors.additional_questions = "Fill both question and answer, or leave both empty.";
  }

  return errors;
}

function toSubmitPayload(values: ApplicationFormState): ApplicationFormSubmitPayload {
  return {
    applicant_name: values.full_name.trim(),
    applicant_email: values.email.trim(),
    applicant_phone: values.phone.trim(),
    resume_url: values.resume_url.trim(),
    cover_letter: values.cover_letter,
    portfolio_links: values.portfolio_links.map((item) => item.trim()).filter((item) => item.length > 0),
    additional_questions: values.additional_questions
      .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0),
    additional_documents: values.additional_documents.map((item) => item.trim()).filter((item) => item.length > 0),
  };
}

function mergeProfileData(current: ApplicationFormState, profileDefaults?: ApplicationProfileDefaults): ApplicationFormState {
  const profileLinks = normalizeLinks(profileDefaults?.portfolioLinks);

  return {
    ...current,
    full_name: current.full_name.trim() || profileDefaults?.fullName?.trim() || "",
    email: current.email.trim() || profileDefaults?.email?.trim() || "",
    phone: current.phone.trim() || profileDefaults?.phone?.trim() || "",
    resume_url: current.resume_url.trim() || profileDefaults?.resumeUrl?.trim() || "",
    cover_letter: stripHtml(current.cover_letter).length > 0 ? current.cover_letter : defaultCoverLetter,
    portfolio_links: current.portfolio_links.some((item) => item.trim().length > 0) ? current.portfolio_links : profileLinks,
  };
}

function setValueAt(items: string[], index: number, value: string): string[] {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

export default function ApplicationForm({ profileDefaults, submitting = false, onSubmit }: ApplicationFormProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<ApplicationFormState>(() => buildInitialState(profileDefaults));
  const [errors, setErrors] = useState<ApplicationFormErrors>({});

  const coverLetterCharacters = useMemo(() => stripHtml(form.cover_letter).length, [form.cover_letter]);

  function applyEditorCommand(command: "bold" | "italic" | "insertUnorderedList") {
    editorRef.current?.focus();
    document.execCommand(command);
    setForm((current) => ({
      ...current,
      cover_letter: editorRef.current?.innerHTML ?? "",
    }));
  }

  function applyProfileDefaults() {
    const merged = mergeProfileData(form, profileDefaults);
    setForm(merged);
    if (editorRef.current) {
      editorRef.current.innerHTML = merged.cover_letter;
    }
    return merged;
  }

  async function submitSnapshot(snapshot: ApplicationFormState) {
    const validation = validateForm(snapshot);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    await onSubmit(toSubmitPayload(snapshot));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitSnapshot(form);
  }

  async function handleApplyWithProfile() {
    const merged = applyProfileDefaults();
    await submitSnapshot(merged);
  }

  return (
    <form className="vstack gap-4" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <Input
            label="Full Name"
            value={form.full_name}
            error={errors.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
          />
        </div>
        <div className="col-12 col-lg-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>
        <div className="col-12 col-lg-4">
          <Input
            label="Phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <FileUpload
            label="Resume Upload (PDF, DOC, DOCX)"
            helpText="Base upload field for Issue #22. Real file storage wiring can be added later."
            acceptedTypes=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            existingUrl={form.resume_url}
            onFileSelected={(file) => {
              if (!file) {
                return;
              }
              setForm((current) => ({ ...current, resume_url: file.name }));
            }}
            onUrlChange={(url) => setForm((current) => ({ ...current, resume_url: url }))}
          />
          {errors.resume_url ? <div className="text-danger small mt-1">{errors.resume_url}</div> : null}
        </div>
        <div className="col-12 col-lg-6">
          <div className="border rounded-3 p-3 h-100 bg-light">
            <div className="fw-semibold mb-2">Apply with Profile</div>
            <p className="text-muted small mb-3">
              Auto-fills your profile details, adds a starter cover letter, and submits quickly.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={applyProfileDefaults} disabled={submitting}>
                Auto-fill profile
              </Button>
              <Button type="button" variant="secondary" onClick={handleApplyWithProfile} loading={submitting}>
                Apply with profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="form-label">Cover Letter (Rich Text)</label>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <Button type="button" variant="outline" className="btn-sm" onClick={() => applyEditorCommand("bold")} disabled={submitting}>
            Bold
          </Button>
          <Button type="button" variant="outline" className="btn-sm" onClick={() => applyEditorCommand("italic")} disabled={submitting}>
            Italic
          </Button>
          <Button
            type="button"
            variant="outline"
            className="btn-sm"
            onClick={() => applyEditorCommand("insertUnorderedList")}
            disabled={submitting}
          >
            Bullet List
          </Button>
        </div>
        <div
          ref={editorRef}
          className={`form-control ${errors.cover_letter ? "is-invalid" : ""}`}
          style={{ minHeight: 180 }}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) =>
            setForm((current) => ({
              ...current,
              cover_letter: (event.currentTarget as HTMLDivElement).innerHTML,
            }))
          }
        />
        <div className="d-flex justify-content-between mt-1">
          {errors.cover_letter ? <div className="invalid-feedback d-block">{errors.cover_letter}</div> : <span />}
          <div className="form-text">{coverLetterCharacters} characters</div>
        </div>
      </div>

      <div className="vstack gap-2">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <h3 className="h6 mb-0">Portfolio Links</h3>
          <Button
            type="button"
            variant="outline"
            className="btn-sm"
            onClick={() => setForm((current) => ({ ...current, portfolio_links: [...current.portfolio_links, ""] }))}
            disabled={submitting}
          >
            Add Link
          </Button>
        </div>
        {form.portfolio_links.map((link, index) => (
          <div key={`portfolio-${index}`} className="d-flex gap-2">
            <input
              className="form-control"
              value={link}
              placeholder="https://portfolio.example.com"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  portfolio_links: setValueAt(current.portfolio_links, index, event.target.value),
                }))
              }
            />
            <Button
              type="button"
              variant="outline"
              className="btn-sm"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  portfolio_links:
                    current.portfolio_links.length > 1
                      ? current.portfolio_links.filter((_, itemIndex) => itemIndex !== index)
                      : [""],
                }))
              }
              disabled={submitting}
            >
              Remove
            </Button>
          </div>
        ))}
        {errors.portfolio_links ? <div className="text-danger small">{errors.portfolio_links}</div> : null}
      </div>

      <div className="vstack gap-2">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <h3 className="h6 mb-0">Additional Questions (If Any)</h3>
          <Button
            type="button"
            variant="outline"
            className="btn-sm"
            onClick={() =>
              setForm((current) => ({
                ...current,
                additional_questions: [...current.additional_questions, { id: createId(), question: "", answer: "" }],
              }))
            }
            disabled={submitting}
          >
            Add Question
          </Button>
        </div>
        {form.additional_questions.map((item) => (
          <div key={item.id} className="border rounded-3 p-3">
            <div className="d-flex justify-content-end">
              <Button
                type="button"
                variant="outline"
                className="btn-sm"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    additional_questions:
                      current.additional_questions.length > 1
                        ? current.additional_questions.filter((entry) => entry.id !== item.id)
                        : [{ id: createId(), question: "", answer: "" }],
                  }))
                }
                disabled={submitting}
              >
                Remove
              </Button>
            </div>
            <div className="row g-2">
              <div className="col-12">
                <Input
                  label="Question"
                  value={item.question}
                  placeholder="Tell us why you're a good fit."
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      additional_questions: current.additional_questions.map((entry) =>
                        entry.id === item.id ? { ...entry, question: event.target.value } : entry
                      ),
                    }))
                  }
                />
              </div>
              <div className="col-12">
                <Textarea
                  label="Your Answer"
                  value={item.answer}
                  rows={3}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      additional_questions: current.additional_questions.map((entry) =>
                        entry.id === item.id ? { ...entry, answer: event.target.value } : entry
                      ),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ))}
        {errors.additional_questions ? <div className="text-danger small">{errors.additional_questions}</div> : null}
      </div>

      <div className="vstack gap-2">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <h3 className="h6 mb-0">Additional Document Links</h3>
          <Button
            type="button"
            variant="outline"
            className="btn-sm"
            onClick={() => setForm((current) => ({ ...current, additional_documents: [...current.additional_documents, ""] }))}
            disabled={submitting}
          >
            Add Document
          </Button>
        </div>
        {form.additional_documents.map((item, index) => (
          <div key={`additional-doc-${index}`} className="d-flex gap-2">
            <input
              className="form-control"
              value={item}
              placeholder="https://drive.google.com/..."
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  additional_documents: setValueAt(current.additional_documents, index, event.target.value),
                }))
              }
            />
            <Button
              type="button"
              variant="outline"
              className="btn-sm"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  additional_documents:
                    current.additional_documents.length > 1
                      ? current.additional_documents.filter((_, itemIndex) => itemIndex !== index)
                      : [""],
                }))
              }
              disabled={submitting}
            >
              Remove
            </Button>
          </div>
        ))}
        {errors.additional_documents ? <div className="text-danger small">{errors.additional_documents}</div> : null}
      </div>

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary" loading={submitting}>
          Submit Application
        </Button>
      </div>
    </form>
  );
}
