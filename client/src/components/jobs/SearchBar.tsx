import Button from "../ui/Button";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function SearchBar({ value, onChange, onSearch, onClear }: SearchBarProps) {
  const hasQuery = value.trim().length > 0;

  return (
    <form
      className="d-flex flex-column flex-md-row gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="input-group">
        <span className="input-group-text bg-white">
          <i className="bi bi-search" />
        </span>
        <input
          className="form-control"
          placeholder="Search by title or keywords"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Search jobs"
        />
        {hasQuery ? (
          <button type="button" className="btn btn-outline-secondary" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
