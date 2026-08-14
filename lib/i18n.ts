export type Language = "om" | "en" | "am";

export const languageOptions: Array<{ code: Language; short: string; label: string }> = [
  { code: "om", short: "OR", label: "Afaan Oromoo" },
  { code: "en", short: "EN", label: "English" },
  { code: "am", short: "አማ", label: "አማርኛ" },
];

export function localized(
  language: Language,
  values: { om: string; en: string; am: string },
) {
  return values[language];
}
