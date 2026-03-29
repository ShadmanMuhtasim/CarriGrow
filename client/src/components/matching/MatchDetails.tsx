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
      <div className="vstack gap-4">
        <div>
          <div className="text-muted small">Overall match</div>
          <div className="display-6">{match.percentage}%</div>
        </div>

        <SkillGapChart matchedCount={match.matchedSkills.length} missingCount={match.missingSkills.length} />

        <div>
          <div className="fw-semibold mb-2">Matched skills</div>
          <div className="d-flex flex-wrap gap-2">
            {match.matchedSkills.length > 0 ? match.matchedSkills.map((skill) => <span key={skill} className="badge text-bg-success rounded-pill">{skill}</span>) : <span className="text-muted small">No matched skills yet.</span>}
          </div>
        </div>

        <div>
          <div className="fw-semibold mb-2">Missing skills</div>
          <div className="d-flex flex-wrap gap-2">
            {match.missingSkills.length > 0 ? match.missingSkills.map((skill) => <span key={skill} className="badge text-bg-warning rounded-pill">{skill}</span>) : <span className="text-muted small">No missing skills.</span>}
          </div>
        </div>

        <div>
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
