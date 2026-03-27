import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../form/Select";
import Textarea from "../form/Textarea";
import type { JobFormValues } from "./jobFormSchema";
import { currencyOptions } from "./jobFormSchema";

type JobFormStep3Props = {
  register: UseFormRegister<JobFormValues>;
  errors: FieldErrors<JobFormValues>;
};

export default function JobFormStep3({ register, errors }: JobFormStep3Props) {
  return (
    <div className="row g-3">
      <div className="col-12 col-md-4">
        <Input label="Minimum Salary" type="number" min="0" error={errors.salary_min?.message} {...register("salary_min")} />
      </div>
      <div className="col-12 col-md-4">
        <Input label="Maximum Salary" type="number" min="0" error={errors.salary_max?.message} {...register("salary_max")} />
      </div>
      <div className="col-12 col-md-4">
        <Select label="Currency" options={currencyOptions.map((option) => ({ ...option }))} error={errors.salary_currency?.message} {...register("salary_currency")} />
      </div>
      <div className="col-12">
        <Textarea
          label="Benefits"
          rows={4}
          placeholder="Health insurance, remote budget, paid leave, learning stipend..."
          error={errors.benefits?.message}
          {...register("benefits")}
        />
      </div>
    </div>
  );
}
