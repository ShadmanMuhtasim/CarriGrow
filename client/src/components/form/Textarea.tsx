import { forwardRef, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className = "", ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div>
      {label ? (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        ref={ref}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
        {...props}
      />
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
