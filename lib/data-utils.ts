import { createServerSupabaseClient, getClientSupabaseInstance } from "./supabase"

// プロジェクト関連の関数
export const getProjects = async () => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export const getProjectById = async (id: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export const createProject = async (projectData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("projects").insert(projectData).select()

  if (error) throw error
  return data
}

export const updateProject = async (id: string, projectData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("projects").update(projectData).eq("id", id).select()

  if (error) throw error
  return data
}

export const deleteProject = async (id: string) => {
  const supabase = getClientSupabaseInstance()
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) throw error
  return true
}

// スタッフ関連の関数
export const getStaff = async () => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

  if (error) throw error
  return data
}

export const getStaffById = async (id: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("staff").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export const createStaff = async (staffData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("staff").insert(staffData).select()

  if (error) throw error
  return data
}

export const updateStaff = async (id: string, staffData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("staff").update(staffData).eq("id", id).select()

  if (error) throw error
  return data
}

export const deleteStaff = async (id: string) => {
  const supabase = getClientSupabaseInstance()
  const { error } = await supabase.from("staff").delete().eq("id", id)

  if (error) throw error
  return true
}

// リソース関連の関数
export const getResources = async () => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("resources").select("*").order("name", { ascending: true })

  if (error) throw error
  return data
}

export const getResourceById = async (id: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("resources").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

// シフト関連の関数
export const getShifts = async (startDate?: string, endDate?: string) => {
  const supabase = createServerSupabaseClient()
  let query = supabase.from("shifts").select(`
      *,
      projects(id, name),
      staff(id, full_name),
      resources(id, name)
    `)

  if (startDate) {
    query = query.gte("start_time", startDate)
  }

  if (endDate) {
    query = query.lte("end_time", endDate)
  }

  const { data, error } = await query.order("start_time", { ascending: true })

  if (error) throw error
  return data
}

// 休暇申請関連の関数
export const getLeaveRequests = async () => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("leave_requests")
    .select(`
      *,
      staff(id, full_name)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export const createLeaveRequest = async (leaveData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("leave_requests").insert(leaveData).select()

  if (error) throw error
  return data
}

export const updateLeaveRequest = async (id: string, leaveData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("leave_requests").update(leaveData).eq("id", id).select()

  if (error) throw error
  return data
}

// 日報関連の関数
export const getDailyReports = async (projectId?: string) => {
  const supabase = createServerSupabaseClient()
  let query = supabase.from("daily_reports").select(`
      *,
      projects(id, name),
      profiles:submitted_by(id, full_name)
    `)

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query.order("report_date", { ascending: false })

  if (error) throw error
  return data
}

export const createDailyReport = async (reportData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("daily_reports").insert(reportData).select()

  if (error) throw error
  return data
}

// 安全点検記録関連の関数
export const getSafetyInspections = async (projectId?: string) => {
  const supabase = createServerSupabaseClient()
  let query = supabase.from("safety_inspections").select(`
      *,
      projects(id, name),
      profiles:inspector(id, full_name)
    `)

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query.order("inspection_date", { ascending: false })

  if (error) throw error
  return data
}

export const createSafetyInspection = async (inspectionData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("safety_inspections").insert(inspectionData).select()

  if (error) throw error
  return data
}

// プロフィール関連の関数
export const getProfile = async (userId: string) => {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, profileData) => {
  const supabase = getClientSupabaseInstance()
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select()

  if (error) throw error
  return data
}
