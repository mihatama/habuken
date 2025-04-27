import { OwnershipType } from "../enums"

/**
 * 基本リソース型（重機と車両の共通インターフェース）
 */
export interface Resource {
  id: string
  name: string
  type: string
  location: string | null
  last_inspection_date: string | null
  ownership_type: OwnershipType
  daily_rate: number | null
  weekly_rate: number | null
  monthly_rate: number | null
  created_at: string
  updated_at: string
}

/**
 * 重機型
 */
export interface HeavyMachinery extends Resource {}

/**
 * 車両型
 */
export interface Vehicle extends Resource {}

/**
 * 新規リソース作成時の型（ID、作成日時、更新日時を除く）
 */
export type NewResource = Omit<Resource, "id" | "created_at" | "updated_at">

/**
 * リソース更新時の型（すべてのフィールドがオプショナル）
 */
export type UpdateResource = Partial<NewResource>

/**
 * フォーム入力用のリソース型（数値フィールドを文字列として扱う）
 */
export interface ResourceFormValues {
  name: string
  type: string
  location: string
  last_inspection_date: string
  ownership_type: OwnershipType
  daily_rate: string
  weekly_rate: string
  monthly_rate: string
}

/**
 * 新規リソースフォームの初期値
 */
export const initialResourceFormValues: ResourceFormValues = {
  name: "",
  type: "",
  location: "",
  last_inspection_date: "",
  ownership_type: OwnershipType.OwnedByCompany,
  daily_rate: "",
  weekly_rate: "",
  monthly_rate: "",
}

/**
 * フォーム値をリソースモデルに変換する関数
 */
export function formValuesToResource(values: ResourceFormValues): NewResource {
  return {
    name: values.name,
    type: values.type,
    location: values.location || null,
    last_inspection_date: values.last_inspection_date || null,
    ownership_type: values.ownership_type,
    daily_rate: values.daily_rate ? Number.parseFloat(values.daily_rate) : null,
    weekly_rate: values.weekly_rate ? Number.parseFloat(values.weekly_rate) : null,
    monthly_rate: values.monthly_rate ? Number.parseFloat(values.monthly_rate) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * リソースモデルをフォーム値に変換する関数
 */
export function resourceToFormValues(resource: Resource): ResourceFormValues {
  return {
    name: resource.name,
    type: resource.type,
    location: resource.location || "",
    last_inspection_date: resource.last_inspection_date
      ? new Date(resource.last_inspection_date).toISOString().split("T")[0]
      : "",
    ownership_type: resource.ownership_type,
    daily_rate: resource.daily_rate !== null ? resource.daily_rate.toString() : "",
    weekly_rate: resource.weekly_rate !== null ? resource.weekly_rate.toString() : "",
    monthly_rate: resource.monthly_rate !== null ? resource.monthly_rate.toString() : "",
  }
}
