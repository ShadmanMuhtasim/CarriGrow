import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
  error?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, id, className = "", ...props },
  ref
) {
  const selectId = id ?? props.name;

  return (
    <div>
      {label ? (
        <label className="form-label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        ref={ref}
        className={`form-select ${error ? "is-invalid" : ""} ${className}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
