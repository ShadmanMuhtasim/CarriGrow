type LoadingProps = {
  label?: string;
  fullPage?: boolean;
};

export default function Loading({ label = "Loading...", fullPage = false }: LoadingProps) {
  return (
    <div className={`d-flex align-items-center justify-content-center gap-2 ${fullPage ? "min-vh-100" : "py-4"}`}>
      <div className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
      <span className="text-muted">{label}</span>
    </div>
  );
}
