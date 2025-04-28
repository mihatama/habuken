import type { Database } from "../supabase"

/**
 * ユーザーロールを表す文字列リテラル型
 * システム内でのユーザーの権限レベルを定義します
 */
export type UserRole = "admin" | "manager" | "staff" | "user"

/**
 * ユーザーロールの表示名マッピング
 */
export const USER_ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "管理者",
  manager: "マネージャー",
  staff: "スタッフ",
  user: "一般ユーザー",
}

/**
 * ユーザーロールのバッジバリアントマッピング
 */
export const USER_ROLE_BADGE_VARIANTS: Record<UserRole, string> = {
  admin: "destructive",
  manager: "default",
  staff: "secondary",
  user: "outline",
}

/**
 * 認証済みユーザー型
 */
export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    full_name: string
    role: UserRole
  }
}

/**
 * ユーザー型
 */
export interface User {
  id: string
  email: string
  full_name: string | null
  position: string | null
  department: string | null
  created_at: string
  roles: string[]
  user_id: string | null
}

/**
 * ユーザー作成ペイロード型
 */
export interface CreateUserPayload {
  email: string
  userId: string
  fullName: string
  department?: string
  position?: string
}

export type UserRoleType = Database["public"]["Tables"]["user_roles"]["Row"]
