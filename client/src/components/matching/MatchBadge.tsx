import Badge from "../ui/Badge";

type MatchBadgeProps = {
  percentage: number;
};

function variantForPercentage(percentage: number): "danger" | "warning" | "success" {
  if (percentage >= 75) {
    return "success";
  }
  if (percentage >= 45) {
    return "warning";
  }
  return "danger";
}

export default function MatchBadge({ percentage }: MatchBadgeProps) {
  return (
    <Badge variant={variantForPercentage(percentage)}>
      <span className="match-badge-content">
        <span className="match-badge-value">{percentage}%</span>
        <span className="match-badge-label">match</span>
      </span>
    </Badge>
  );
}
