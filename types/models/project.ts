import { ProjectStatus } from "../enums"

/**
 * プロジェクト型
 */
export interface Project {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string | null
  status: ProjectStatus
  client: string | null
  location: string | null
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * 新規プロジェクト作成時の型（ID、作成日時、更新日時を除く）
 */
export type NewProject = Omit<Project, "id" | "created_at" | "updated_at">

/**
 * プロジェクト更新時の型（すべてのフィールドがオプショナル）
 */
export type UpdateProject = Partial<NewProject>

/**
 * プロジェクトフォーム値の型
 */
export interface ProjectFormValues {
  name: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
  client: string
  location: string
  selectedStaff: string[]
  selectedHeavyMachinery: string[]
  selectedVehicles: string[]
  selectedTools: string[]
}

/**
 * 新規プロジェクトフォームの初期値
 */
export const initialProjectFormValues: ProjectFormValues = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: ProjectStatus.NotStarted,
  client: "",
  location: "",
  selectedStaff: [],
  selectedHeavyMachinery: [],
  selectedVehicles: [],
  selectedTools: [],
}

/**
 * フォーム値をプロジェクトモデルに変換する関数
 */
export function formValuesToProject(values: ProjectFormValues, userId: string): NewProject {
  return {
    name: values.name,
    description: values.description || null,
    start_date: values.startDate,
    end_date: values.endDate || null,
    status: values.status,
    client: values.client || null,
    location: values.location || null,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * プロジェクトモデルをフォーム値に変換する関数
 */
export function projectToFormValues(
  project: Project,
): Omit<ProjectFormValues, "selectedStaff" | "selectedHeavyMachinery" | "selectedVehicles" | "selectedTools"> {
  return {
    name: project.name,
    description: project.description || "",
    startDate: project.start_date ? project.start_date.split("T")[0] : "",
    endDate: project.end_date ? project.end_date.split("T")[0] : "",
    status: project.status,
    client: project.client || "",
    location: project.location || "",
  }
}
