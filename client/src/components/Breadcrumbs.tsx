type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  void items;

  // Breadcrumb visibility is intentionally disabled in the current UX pass.
  return null;

  /*
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-3">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className={`breadcrumb-item ${isLast ? "active" : ""}`} aria-current={isLast ? "page" : undefined}>
              {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : item.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
  */
}
