import { forwardRef, type InputHTMLAttributes } from "react";

type CheckboxRadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  type?: "checkbox" | "radio";
  error?: string;
};

const CheckboxRadio = forwardRef<HTMLInputElement, CheckboxRadioProps>(function CheckboxRadio(
  { label, type = "checkbox", error, className = "", id, ...props },
  ref
) {
  const inputId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div>
      <div className={`form-check ${className}`.trim()}>
        <input
          id={inputId}
          ref={ref}
          className={`form-check-input ${error ? "is-invalid" : ""}`}
          type={type}
          {...props}
        />
        <label htmlFor={inputId} className="form-check-label">
          {label}
        </label>
      </div>
      {error ? <div className="invalid-feedback d-block">{error}</div> : null}
    </div>
  );
});

CheckboxRadio.displayName = "CheckboxRadio";

export default CheckboxRadio;
