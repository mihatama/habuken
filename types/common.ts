import type { Database } from "./supabase"

// Supabaseのテーブル型をエクスポート
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Staff = Database["public"]["Tables"]["staff"]["Row"]
export type Resource = Database["public"]["Tables"]["resources"]["Row"]
export type Shift = Database["public"]["Tables"]["shifts"]["Row"]
export type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"]
export type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"]
export type SafetyInspection = Database["public"]["Tables"]["safety_inspections"]["Row"]
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"]

// ユーザーロールを表す文字列リテラル型
export type UserRoleType = "admin" | "manager" | "staff" | "user"

// ユーザーの部署を表す文字列リテラル型
export type UserDepartment = "IT部" | "営業部" | "工事部" | "管理部" | "設計部" | string

// ユーザーロールの表示名マッピング
export const USER_ROLE_DISPLAY_NAMES: Record<UserRoleType, string> = {
  admin: "管理者",
  manager: "マネージャー",
  staff: "スタッフ",
  user: "一般ユーザー",
}

// ユーザーロールのバッジバリアントマッピング
export const USER_ROLE_BADGE_VARIANTS: Record<UserRoleType, string> = {
  admin: "destructive",
  manager: "default",
  staff: "secondary",
  user: "outline",
}
