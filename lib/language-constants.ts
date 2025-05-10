export const SUPPORTED_LANGUAGES_V0 = ["ja", "en"] as const
export const LANGUAGE_LABELS: Record<(typeof SUPPORTED_LANGUAGES_V0)[number], string> = {
  ja: "日本語",
  en: "English",
}
