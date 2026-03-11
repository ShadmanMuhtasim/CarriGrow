import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Card({ title, subtitle, actions, children, className = "" }: CardProps) {
  return (
    <div className={`card border-0 shadow-sm ${className}`.trim()}>
      <div className="card-body">
        {title || subtitle || actions ? (
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              {title ? <h2 className="h5 fw-bold mb-1">{title}</h2> : null}
              {subtitle ? <p className="text-muted mb-0">{subtitle}</p> : null}
            </div>
            {actions}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
