export const colors = {
  background: "#000000",
  elevated: "#0A0A0A",
  surface: "#111111",
  surfaceDark: "#171717",
  textPrimary: "#FAFAFA",
  textSecondary: "#D4D4D4",
  muted: "#A3A3A3",
  disabled: "#737373",
  placeholder: "#525252",
  border: "#262626",
  accent: "#EF4444",
} as const;

export type ColorToken = keyof typeof colors;
