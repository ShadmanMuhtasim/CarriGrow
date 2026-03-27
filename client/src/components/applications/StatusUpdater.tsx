import Select from "../form/Select";
import Button from "../ui/Button";
import type { ApplicationStatus } from "./StatusBadge";

type StatusUpdaterProps = {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  onSave?: () => void;
  saving?: boolean;
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

export default function StatusUpdater({ value, onChange, onSave, saving = false }: StatusUpdaterProps) {
  return (
    <div className="d-flex flex-column flex-md-row gap-2 align-items-md-end">
      <div className="flex-grow-1">
        <Select
          label="Application Status"
          options={statusOptions}
          value={value}
          onChange={(event) => onChange(event.target.value as ApplicationStatus)}
        />
      </div>
      {onSave ? (
        <Button type="button" variant="primary" loading={saving} onClick={onSave}>
          Save status
        </Button>
      ) : null}
    </div>
  );
}
