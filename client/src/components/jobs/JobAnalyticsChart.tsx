type DataPoint = {
  label: string;
  value: number;
};

type JobAnalyticsChartProps = {
  title: string;
  subtitle: string;
  colorClass: string;
  data: DataPoint[];
};

export default function JobAnalyticsChart({ title, subtitle, colorClass, data }: JobAnalyticsChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="border rounded-3 p-3 h-100">
      <div className="fw-semibold">{title}</div>
      <div className="text-muted small mb-3">{subtitle}</div>

      <div className="d-flex align-items-end gap-2" style={{ minHeight: 180 }}>
        {data.map((item) => (
          <div key={item.label} className="flex-fill text-center">
            <div
              className={`rounded-top ${colorClass}`}
              style={{
                height: `${Math.max((item.value / maxValue) * 140, 10)}px`,
                opacity: 0.9,
              }}
              title={`${item.label}: ${item.value}`}
            />
            <div className="small fw-semibold mt-2">{item.value}</div>
            <div className="small text-muted">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
