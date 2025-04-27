/**
 * ユーザーロールを表す文字列リテラル型
 * システム内でのユーザーの権限レベルを定義します
 */
export type UserRole = "admin" | "manager" | "staff" | "user"

/**
 * ユーザーの部署を表す文字列リテラル型
 * 組織内での所属部署を定義します
 */
export type UserDepartment = "IT部" | "営業部" | "工事部" | "管理部" | "設計部" | string

/**
 * ユーザーの基本情報を表す型
 * システム内のユーザーエンティティの基本構造を定義します
 */
export interface User {
  /** ユーザーの一意識別子 */
  id: string
  /** ユーザーのメールアドレス（ログインに使用） */
  email: string
  /** ユーザーのフルネーム */
  full_name: string
  /** ユーザーの役職（null許容） */
  position: string | null
  /** ユーザーの部署（null許容） */
  department: string | null
  /** ユーザー作成日時 */
  created_at: string
  /** ユーザーに割り当てられたロール */
  roles: UserRole[]
  /** ユーザーID（ログイン用ID） */
  user_id?: string
}

/**
 * ユーザープロファイル情報を表す型
 * ユーザーの詳細情報を定義します
 */
export interface UserProfile {
  /** ユーザーの一意識別子（User.idと一致） */
  user_id: string
  /** プロフィール画像のURL */
  avatar_url?: string | null
  /** 電話番号 */
  phone_number?: string | null
  /** 住所 */
  address?: string | null
  /** 緊急連絡先 */
  emergency_contact?: string | null
  /** 入社日 */
  hire_date?: string | null
  /** スキルや資格のリスト */
  skills?: string[] | null
  /** 備考 */
  notes?: string | null
  /** 最終更新日時 */
  updated_at?: string | null
}

/**
 * ユーザー作成時に必要な情報を表す型
 * 新規ユーザー作成時のペイロードとして使用します
 */
export interface CreateUserPayload {
  email: string
  userId: string
  fullName: string
  role: UserRole
  department?: string
  position?: string
  password?: string // 実際の実装では必要に応じて
}

/**
 * ユーザー作成レスポンスを表す型
 * ユーザー作成APIのレスポンスとして使用します
 */
export interface CreateUserResponse {
  success: boolean
  user?: User
  error?: string
}

/**
 * ユーザー一覧取得レスポンスを表す型
 * ユーザー一覧取得APIのレスポンスとして使用します
 */
export interface GetUsersResponse {
  success: boolean
  users?: User[]
  error?: string
}

/**
 * ユーザー更新ペイロードを表す型
 * ユーザー情報更新時のペイロードとして使用します
 */
export interface UpdateUserPayload {
  id: string
  email?: string
  fullName?: string
  role?: UserRole
  department?: string
  position?: string
}

/**
 * ユーザー認証情報を表す型
 * 認証コンテキストで使用します
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
 * ユーザーロールの表示名マッピング
 * ロールの内部値と表示名の対応を定義します
 */
export const USER_ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "管理者",
  manager: "マネージャー",
  staff: "スタッフ",
  user: "一般ユーザー",
}

/**
 * ユーザーロールのバッジバリアントマッピング
 * ロールごとのバッジスタイルを定義します
 */
export const USER_ROLE_BADGE_VARIANTS: Record<UserRole, string> = {
  admin: "destructive",
  manager: "default",
  staff: "secondary",
  user: "outline",
}
