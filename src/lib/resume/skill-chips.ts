/** Parse comma-separated skill items into trimmed chips. */
export function parseSkillChips(items: string): string[] {
  return items
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Serialize chips back to the schema string format. */
export function joinSkillChips(chips: string[]): string {
  return chips.map((c) => c.trim()).filter(Boolean).join(", ");
}

/**
 * Append a draft token to chips. Returns null if nothing to add
 * (empty or duplicate, case-insensitive).
 */
export function appendSkillChip(
  chips: string[],
  draft: string
): string[] | null {
  const value = draft.trim().replace(/,+$/, "").trim();
  if (!value) return null;
  const exists = chips.some((c) => c.toLowerCase() === value.toLowerCase());
  if (exists) return null;
  return [...chips, value];
}
