import * as z from "zod"

// Define the validation schema for the inspection form
export const inspectionFormSchema = z.object({
  projectId: z.string().min(1, { message: "工事名を選択してください" }),
  date: z.string().min(1, { message: "日付を入力してください" }),
  inspector: z.string().min(1, { message: "点検者名を入力してください" }),
  weather: z.string().optional(),
  generalNotes: z.string().optional(),
})

// Define the ValidationErrors type
export type ValidationErrors = {
  [key: string]: string
}

// Validate data against a schema
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: any,
): { isValid: boolean; errors: ValidationErrors } {
  try {
    schema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {}
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const path = err.path[0].toString()
          errors[path] = err.message
        }
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { _form: "入力内容に問題があります" } }
  }
}
