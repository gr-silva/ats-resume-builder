const MAX_IMPORT_CHARS = 24_000;

export function normalizeResumeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, MAX_IMPORT_CHARS);
}

export function isImportTextValid(text: string): boolean {
  return normalizeResumeText(text).length >= 80;
}
