import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Input from "../ui/Input";
import Select from "../form/Select";
import type { JobFormValues } from "./jobFormSchema";
import { employmentTypeOptions, experienceLevelOptions } from "./jobFormSchema";

type JobFormStep1Props = {
  register: UseFormRegister<JobFormValues>;
  errors: FieldErrors<JobFormValues>;
};

export default function JobFormStep1({ register, errors }: JobFormStep1Props) {
  return (
    <div className="row g-3">
      <div className="col-12">
        <Input label="Job Title" placeholder="Senior Frontend Developer" error={errors.title?.message} {...register("title")} />
      </div>
      <div className="col-12 col-md-6">
        <Input label="Location" placeholder="Dhaka, Bangladesh" error={errors.location?.message} {...register("location")} />
      </div>
      <div className="col-12 col-md-6">
        <Select label="Employment Type" options={employmentTypeOptions.map((option) => ({ ...option }))} error={errors.employment_type?.message} {...register("employment_type")} />
      </div>
      <div className="col-12 col-md-6">
        <Select label="Experience Level" options={experienceLevelOptions.map((option) => ({ ...option }))} error={errors.experience_level?.message} {...register("experience_level")} />
      </div>
      <div className="col-12 col-md-6">
        <div className="border rounded-3 p-3 bg-light h-100">
          <div className="fw-semibold mb-2">Step 1 intent</div>
          <p className="text-muted mb-0">
            Capture the core listing metadata first so later contributors can plug filters, previews, and analytics into
            stable job basics.
          </p>
        </div>
      </div>
    </div>
  );
}
