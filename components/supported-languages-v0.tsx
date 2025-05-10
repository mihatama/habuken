"use client"

import { SUPPORTED_LANGUAGES_V0, LANGUAGE_LABELS } from "@/lib/language-constants"

export function SupportedLanguagesV0() {
  return (
    <div className="flex flex-wrap gap-2">
      {SUPPORTED_LANGUAGES_V0.map((lang) => (
        <span key={lang} className="px-2 py-1 bg-gray-200 rounded text-sm">
          {LANGUAGE_LABELS[lang]}
        </span>
      ))}
    </div>
  )
}
