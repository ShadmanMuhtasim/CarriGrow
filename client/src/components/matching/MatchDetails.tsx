import Modal from "../ui/Modal";
import SkillGapChart from "./SkillGapChart";
import type { JobMatchResult } from "./matchUtils";

type MatchDetailsProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  match: JobMatchResult;
};

export default function MatchDetails({ open, onClose, title, match }: MatchDetailsProps) {
  return (
    <Modal open={open} onClose={onClose} title={`${title} match details`}>
      <div className="vstack gap-3">
        <div className="match-details-hero border rounded-3 p-3">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <div className="text-uppercase small text-muted fw-semibold">Overall match</div>
              <div className="display-6 fw-bold mb-0">{match.percentage}%</div>
              <div className="small text-muted mt-1">
                {match.percentage >= 80
                  ? "Strong fit for this role."
                  : match.percentage >= 60
                    ? "Good fit with a few skill gaps."
                    : "Needs more preparation for this role."}
              </div>
            </div>
            <div className="text-end">
              <div className="badge text-bg-light border rounded-pill px-3 py-2">
                Matched {match.matchedSkills.length}
              </div>
              <div className="badge text-bg-light border rounded-pill px-3 py-2 ms-2">
                Missing {match.missingSkills.length}
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-3 p-3">
          <SkillGapChart matchedCount={match.matchedSkills.length} missingCount={match.missingSkills.length} />
        </div>

        <div className="border rounded-3 p-3">
          <div className="fw-semibold mb-2">Matched skills</div>
          <div className="d-flex flex-wrap gap-2">
            {match.matchedSkills.length > 0 ? match.matchedSkills.map((skill) => <span key={skill} className="badge text-bg-success rounded-pill">{skill}</span>) : <span className="text-muted small">No matched skills yet.</span>}
          </div>
        </div>

        <div className="border rounded-3 p-3">
          <div className="fw-semibold mb-2">Missing skills</div>
          <div className="d-flex flex-wrap gap-2">
            {match.missingSkills.length > 0 ? match.missingSkills.map((skill) => <span key={skill} className="badge text-bg-warning rounded-pill">{skill}</span>) : <span className="text-muted small">No missing skills.</span>}
          </div>
        </div>

        <div className="border rounded-3 p-3">
          <div className="fw-semibold mb-2">Suggested skills to learn</div>
          <div className="d-flex flex-wrap gap-2">
            {match.suggestedSkills.map((skill) => (
              <span key={skill} className="badge text-bg-light border rounded-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
