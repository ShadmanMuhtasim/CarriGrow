import type { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "light";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  pill?: boolean;
};

const variantClass: Record<BadgeVariant, string> = {
  primary: "text-bg-primary",
  secondary: "text-bg-secondary",
  success: "text-bg-success",
  warning: "text-bg-warning",
  danger: "text-bg-danger",
  light: "text-bg-light border",
};

export default function Badge({ children, variant = "light", pill = true }: BadgeProps) {
  return <span className={`badge ${variantClass[variant]} ${pill ? "rounded-pill" : ""}`.trim()}>{children}</span>;
}
