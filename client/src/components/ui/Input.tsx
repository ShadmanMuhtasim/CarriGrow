import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
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
      <input
        id={inputId}
        ref={ref}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
        {...props}
      />
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
