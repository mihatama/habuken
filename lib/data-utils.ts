import { createServerSupabaseClient, getClientSupabaseInstance } from "./supabase"

// エラーハンドリングを改善した共通関数
async function handleSupabaseOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : "不明なエラー"}`)
  }
}

// リトライロジックを追加した関数
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`操作に失敗しました (${attempt + 1}/${maxRetries}): ${lastError.message}`)

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error("不明なエラーが発生しました")
}

// プロジェクト関連の関数
export const getProjects = async () => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data
  }, "プロジェクト一覧の取得に失敗しました")
}

export const getProjectById = async (id: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }, `プロジェクト(ID: ${id})の取得に失敗しました`)
}

export const createProject = async (projectData: any) => {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("projects").insert(projectData).select()

    if (error) throw error
    return data
  })
}

export const updateProject = async (id: string, projectData: any) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("projects").update(projectData).eq("id", id).select()

    if (error) throw error
    return data
  }, `プロジェクト(ID: ${id})の更新に失敗しました`)
}

export const deleteProject = async (id: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) throw error
    return true
  }, `プロジェクト(ID: ${id})の削除に失敗しました`)
}

// スタッフ関連の関数
export const getStaff = async () => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

    if (error) throw error
    return data
  }, "スタッフ一覧の取得に失敗しました")
}

export const getStaffById = async (id: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("staff").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }, `スタッフ(ID: ${id})の取得に失敗しました`)
}

export const createStaff = async (staffData: any) => {
  return withRetry(
    async () => {
      const supabase = getClientSupabaseInstance()
      const { data, error } = await supabase.from("staff").insert(staffData).select()

      if (error) throw error
      return data
    },
    3,
    1000,
  )
}

export const updateStaff = async (id: string, staffData: any) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("staff").update(staffData).eq("id", id).select()

    if (error) throw error
    return data
  }, `スタッフ(ID: ${id})の更新に失敗しました`)
}

export const deleteStaff = async (id: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { error } = await supabase.from("staff").delete().eq("id", id)

    if (error) throw error
    return true
  }, `スタッフ(ID: ${id})の削除に失敗しました`)
}

// リソース関連の関数
export const getResources = async () => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("resources").select("*").order("name", { ascending: true })

    if (error) throw error
    return data
  }, "リソース一覧の取得に失敗しました")
}

export const getResourceById = async (id: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("resources").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }, `リソース(ID: ${id})の取得に失敗しました`)
}

// シフト関連の関数
export const getShifts = async (startDate?: string, endDate?: string) => {
  return handleSupabaseOperation(async () => {
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
  }, "シフト情報の取得に失敗しました")
}

// 休暇申請関連の関数
export const getLeaveRequests = async () => {
  return handleSupabaseOperation(async () => {
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
  }, "休暇申請一覧の取得に失敗しました")
}

export const createLeaveRequest = async (leaveData: any) => {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("leave_requests").insert(leaveData).select()

    if (error) throw error
    return data
  })
}

export const updateLeaveRequest = async (id: string, leaveData: any) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("leave_requests").update(leaveData).eq("id", id).select()

    if (error) throw error
    return data
  }, `休暇申請(ID: ${id})の更新に失敗しました`)
}

// 日報関連の関数
export const getDailyReports = async (projectId?: string) => {
  return handleSupabaseOperation(async () => {
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
  }, "日報一覧の取得に失敗しました")
}

export const createDailyReport = async (reportData: any) => {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("daily_reports").insert(reportData).select()

    if (error) throw error
    return data
  })
}

// 安全点検記録関連の関数
export const getSafetyInspections = async (projectId?: string) => {
  return handleSupabaseOperation(async () => {
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
  }, "安全点検記録一覧の取得に失敗しました")
}

export const createSafetyInspection = async (inspectionData: any) => {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("safety_inspections").insert(inspectionData).select()

    if (error) throw error
    return data
  })
}

// プロフィール関連の関数
export const getProfile = async (userId: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }, `プロフィール(ID: ${userId})の取得に失敗しました`)
}

export const updateProfile = async (userId: string, profileData: any) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select()

    if (error) throw error
    return data
  }, `プロフィール(ID: ${userId})の更新に失敗しました`)
}

// プロジェクト割り当て関連の関数
export const getProjectAssignments = async (projectId: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("project_assignments")
      .select(`
        *,
        staff:staff_id(id, full_name, position),
        heavy_machinery:heavy_machinery_id(id, name, type),
        vehicle:vehicle_id(id, name, type),
        tool:tool_id(id, name, storage_location)
      `)
      .eq("project_id", projectId)

    if (error) throw error
    return data
  }, `プロジェクト割り当て(プロジェクトID: ${projectId})の取得に失敗しました`)
}

export const createProjectAssignment = async (assignmentData: any) => {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()
    const { data, error } = await supabase.from("project_assignments").insert(assignmentData).select()

    if (error) throw error
    return data
  })
}

export const deleteProjectAssignment = async (id: string) => {
  return handleSupabaseOperation(async () => {
    const supabase = getClientSupabaseInstance()
    const { error } = await supabase.from("project_assignments").delete().eq("id", id)

    if (error) throw error
    return true
  }, `プロジェクト割り当て(ID: ${id})の削除に失敗しました`)
}
