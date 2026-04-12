type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav aria-label="Pagination">
      <ul className="pagination mb-0">
        <li className={`page-item ${canPrev ? "" : "disabled"}`}>
          <button className="page-link" onClick={() => canPrev && onChange(page - 1)}>
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNumber = idx + 1;
          return (
            <li key={pageNumber} className={`page-item ${pageNumber === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => onChange(pageNumber)}>
                {pageNumber}
              </button>
            </li>
          );
        })}
        <li className={`page-item ${canNext ? "" : "disabled"}`}>
          <button className="page-link" onClick={() => canNext && onChange(page + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
