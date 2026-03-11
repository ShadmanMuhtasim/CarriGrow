export function arrayToLines(value?: string[] | null): string {
  if (!value || value.length === 0) {
    return "";
  }
  return value.join("\n");
}

export function linesToArray(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function completionPercent(values: Array<string | number | null | undefined>): number {
  if (values.length === 0) {
    return 0;
  }
  const completed = values.filter((value) => {
    if (typeof value === "number") {
      return true;
    }
    return (value ?? "").toString().trim().length > 0;
  }).length;
  return Math.round((completed / values.length) * 100);
}
