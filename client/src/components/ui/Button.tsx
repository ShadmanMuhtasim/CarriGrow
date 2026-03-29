import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline-primary",
  danger: "btn-danger",
};

export default function Button({ variant = "primary", loading = false, icon, children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`btn ${variantClass[variant]} ${className}`.trim()} disabled={loading || props.disabled} {...props}>
      {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
      {!loading && icon ? <span className="me-2">{icon}</span> : null}
      {children}
    </button>
  );
}
