export const alphabeticTextPattern = /^[A-Za-z][A-Za-z\s.'-]*$/;

export function sanitizeAlphabeticText(value: string): string {
  return value.replace(/[^A-Za-z\s.'-]/g, "").replace(/\s{2,}/g, " ");
}

export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}
