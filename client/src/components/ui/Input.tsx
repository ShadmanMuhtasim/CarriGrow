import { forwardRef, useState, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...props },
  ref
) {
  const inputId = id ?? props.name;
  const isPasswordField = props.type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const effectiveType = isPasswordField && showPassword ? "text" : props.type;

  return (
    <div>
      {label ? (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {isPasswordField ? (
        <div className="input-group">
          <input
            id={inputId}
            ref={ref}
            {...props}
            type={effectiveType}
            className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
          />
          <button
            type="button"
            className={`btn btn-outline-secondary ${error ? "is-invalid" : ""}`.trim()}
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
          </button>
        </div>
      ) : (
        <input
          id={inputId}
          ref={ref}
          {...props}
          type={effectiveType}
          className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
        />
      )}
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
