import { z } from "zod"

export type ValidationErrors = Record<string, string>

export function validateWithSchema<T>(schema: z.ZodType<T>, data: any): { isValid: boolean; errors: ValidationErrors } {
  try {
    schema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {}
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { _form: "検証中にエラーが発生しました" } }
  }
}

// 安全点検フォームのスキーマ
export const inspectionFormSchema = z.object({
  projectId: z.string().min(1, "工事名を選択してください"),
  date: z.string().min(1, "日付を入力してください"),
  inspector: z.string().min(1, "点検者名を入力してください"),
  weather: z.string(),
  generalNotes: z.string().optional(),
})

// 日報フォームのスキーマ
export const dailyReportFormSchema = z.object({
  projectId: z.string().min(1, "工事名を選択してください"),
  date: z.string().min(1, "日付を入力してください"),
  weather: z.string(),
})
