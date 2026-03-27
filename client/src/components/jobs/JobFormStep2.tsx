import type { FieldErrors, UseFormRegister } from "react-hook-form";
import Textarea from "../form/Textarea";
import type { JobFormValues } from "./jobFormSchema";

type JobFormStep2Props = {
  register: UseFormRegister<JobFormValues>;
  errors: FieldErrors<JobFormValues>;
};

export default function JobFormStep2({ register, errors }: JobFormStep2Props) {
  return (
    <div className="row g-3">
      <div className="col-12">
        <Textarea
          label="Job Description"
          rows={6}
          placeholder="Describe the role, team, and impact."
          error={errors.description?.message}
          {...register("description")}
        />
      </div>
      <div className="col-12 col-lg-6">
        <Textarea
          label="Requirements"
          rows={6}
          placeholder="List the must-have qualifications. Rich text editor can be added later."
          error={errors.requirements?.message}
          {...register("requirements")}
        />
      </div>
      <div className="col-12 col-lg-6">
        <Textarea
          label="Responsibilities"
          rows={6}
          placeholder="List the day-to-day responsibilities."
          error={errors.responsibilities?.message}
          {...register("responsibilities")}
        />
      </div>
    </div>
  );
}
