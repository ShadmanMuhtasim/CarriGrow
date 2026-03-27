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
  return <Badge variant={variantForPercentage(percentage)}>{percentage}% match</Badge>;
}
