type SkillGapChartProps = {
  matchedCount: number;
  missingCount: number;
};

export default function SkillGapChart({ matchedCount, missingCount }: SkillGapChartProps) {
  const total = Math.max(matchedCount + missingCount, 1);
  const matchedPercent = Math.round((matchedCount / total) * 100);
  const missingPercent = 100 - matchedPercent;

  return (
    <div>
      <div className="d-flex justify-content-between small mb-2">
        <span>Skill gap analysis</span>
        <span>{matchedPercent}% covered</span>
      </div>
      <div className="progress" style={{ height: 12 }}>
        <div className="progress-bar bg-success" style={{ width: `${matchedPercent}%` }} />
        <div className="progress-bar bg-warning" style={{ width: `${missingPercent}%` }} />
      </div>
      <div className="d-flex justify-content-between small text-muted mt-2">
        <span>Matched: {matchedCount}</span>
        <span>Missing: {missingCount}</span>
      </div>
    </div>
  );
}
