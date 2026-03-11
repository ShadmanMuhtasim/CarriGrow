import { forwardRef, type InputHTMLAttributes } from "react";

type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
};

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, error, id, className = "", ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        type="date"
        className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
        {...props}
      />
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
});

DatePicker.displayName = "DatePicker";

export default DatePicker;
