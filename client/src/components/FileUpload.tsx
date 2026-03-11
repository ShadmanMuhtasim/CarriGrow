import { useId, useState } from "react";

type FileUploadProps = {
  label: string;
  helpText?: string;
  acceptedTypes?: string;
  existingUrl?: string | null;
  onFileSelected?: (file: File | null) => void;
  onUrlChange?: (url: string) => void;
};

export default function FileUpload({
  label,
  helpText,
  acceptedTypes = "*",
  existingUrl,
  onFileSelected,
  onUrlChange,
}: FileUploadProps) {
  const inputId = useId();
  const [selectedName, setSelectedName] = useState<string>("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedName(file?.name ?? "");
    if (onFileSelected) {
      onFileSelected(file);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input id={inputId} className="form-control" type="file" accept={acceptedTypes} onChange={handleFileChange} />
      {selectedName ? <div className="form-text">Selected: {selectedName}</div> : null}
      {helpText ? <div className="form-text">{helpText}</div> : null}

      {onUrlChange ? (
        <div className="mt-2">
          <input
            className="form-control"
            placeholder="Or provide a file URL"
            value={existingUrl ?? ""}
            onChange={(event) => onUrlChange(event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
