/**
 * API応答の基本型
 */
export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * ユーザー作成応答型
 */
export interface CreateUserResponse {
  userId: string
}

/**
 * ユーザー一覧取得応答型
 */
export interface GetUsersResponse {
  users: Array<{
    id: string
    email: string
    full_name: string | null
    position: string | null
    department: string | null
    roles: string[]
    created_at: string
  }>
}

/**
 * エラーオブジェクトの型ガード
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * Supabaseエラーオブジェクトの型ガード
 */
export function isSupabaseError(error: unknown): error is { message: string; code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error &&
    typeof (error as any).message === "string" &&
    typeof (error as any).code === "string"
  )
}

/**
 * エラーメッセージを取得する関数
 */
export function getErrorMessage(error: unknown): string {
  if (isSupabaseError(error)) {
    return `${error.message} (コード: ${error.code})`
  } else if (isError(error)) {
    return error.message
  } else if (typeof error === "string") {
    return error
  } else {
    return "不明なエラーが発生しました"
  }
}
