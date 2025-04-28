import { getClientSupabase } from "@/lib/supabase-utils"

/**
 * @deprecated このモジュールは非推奨です。代わりに lib/supabase-utils.ts の関数を使用してください。
 */

// データを取得する汎用関数
async function fetchData(
  tableName: string,
  options: {
    select?: string
    filters?: Record<string, any>
    order?: { column: string; ascending: boolean }
    limit?: number
  } = {},
) {
  console.warn("fetchData は非推奨です。代わりに lib/supabase-utils.ts の fetchClientData を使用してください。")
  const { select = "*", filters, order, limit } = options
  const supabase = getClientSupabase()

  try {
    let query = supabase.from(tableName).select(select, { count: "exact" })

    // フィルターの適用
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === "string" && value.includes("%")) {
            query = query.ilike(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      })
    }

    // 並び順の適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    // 件数制限の適用
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return { data: data || [], count }
  } catch (error) {
    console.error(`Error in fetchData for ${tableName}:`, error)
    throw error
  }
}

// データを挿入する汎用関数
async function insertData(tableName: string, data: any, options: { returning?: string } = {}) {
  console.warn("insertData は非推奨です。代わりに lib/supabase-utils.ts の insertClientData を使用してください。")
  const { returning = "*" } = options
  const supabase = getClientSupabase()

  try {
    const { data: result, error } = await supabase.from(tableName).insert(data).select(returning)

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error)
      throw error
    }

    return result || []
  } catch (error) {
    console.error(`Error in insertData for ${tableName}:`, error)
    throw error
  }
}

// データを削除する汎用関数
async function deleteData(tableName: string, id: string, options: { idField?: string } = {}) {
  console.warn("deleteData は非推奨です。代わりに lib/supabase-utils.ts の deleteClientData を使用してください。")
  const { idField = "id" } = options
  const supabase = getClientSupabase()

  try {
    const { error } = await supabase.from(tableName).delete().eq(idField, id)

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error in deleteData for ${tableName}:`, error)
    throw error
  }
}

// スタッフデータの取得
export async function getStaff() {
  console.warn("getStaff は非推奨です。代わりに lib/supabase-utils.ts の getStaffData を使用してください。")
  const { data } = await fetchData("staff", {
    order: { column: "full_name", ascending: true },
  })

  return data
}

// スタッフの削除
export async function deleteStaff(id: string) {
  console.warn("deleteStaff は非推奨です。代わりに lib/supabase-utils.ts の deleteClientData を使用してください。")
  return deleteData("staff", id)
}

// プロジェクトデータの取得
export async function getProjects() {
  console.warn("getProjects は非推奨です。代わりに lib/supabase-utils.ts の getProjectsData を使用してください。")
  const { data } = await fetchData("projects", {
    order: { column: "name", ascending: true },
  })

  return data
}

// 工具データの取得
export async function getTools() {
  console.warn("getTools は非推奨です。代わりに lib/supabase-utils.ts の getToolsData を使用してください。")
  try {
    // まず、resourcesテーブルのスキーマを確認するためにデータを1件取得
    const { data: columns } = await fetchData("resources", { limit: 1 })

    // テーブルにtype列がある場合
    if (columns && columns.length > 0 && "type" in columns[0]) {
      const { data } = await fetchData("resources", {
        filters: { type: "工具" },
        order: { column: "name", ascending: true },
      })

      return data
    }

    // テーブルにresource_type列がある場合
    else if (columns && columns.length > 0 && "resource_type" in columns[0]) {
      const { data } = await fetchData("resources", {
        filters: { resource_type: "工具" },
        order: { column: "name", ascending: true },
      })

      return data
    }

    // どちらの列もない場合は、全てのリソースを取得
    else {
      const { data } = await fetchData("resources", {
        order: { column: "name", ascending: true },
      })

      return data
    }
  } catch (error) {
    console.error("工具データ取得エラー:", error)
    throw error
  }
}

// 休暇データの取得（leave_requestsテーブルを使用）
export async function getVacations() {
  console.warn("getVacations は非推奨です。代わりに lib/supabase-utils.ts の getLeaveRequestsData を使用してください。")
  try {
    const supabase = getClientSupabase()
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        id,
        staff_id,
        start_date,
        end_date,
        reason,
        status
      `)
      .order("start_date", { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return []
    }

    // スタッフIDのリストを作成
    const staffIds = [...new Set(data.map((item) => item.staff_id).filter(Boolean))]

    // スタッフデータを取得
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("id, full_name")
      .in("id", staffIds)

    if (staffError) {
      console.error("スタッフデータ取得エラー:", staffError)
      // スタッフデータの取得に失敗しても、休暇データは返す
    }

    // スタッフIDをキーとしたマップを作成
    const staffMap = new Map()
    staffData?.forEach((staff) => {
      staffMap.set(staff.id, staff.full_name)
    })

    // データを整形
    return data.map((item) => ({
      id: item.id,
      staffId: item.staff_id,
      staffName: staffMap.get(item.staff_id) || "不明",
      startDate: item.start_date,
      endDate: item.end_date,
      reason: item.reason,
      status: item.status,
    }))
  } catch (error) {
    console.error("休暇データ取得エラー:", error)
    throw error
  }
}

// 休暇申請データを取得する関数
export async function getLeaveRequests() {
  console.warn(
    "getLeaveRequests は非推奨です。代わりに lib/supabase-utils.ts の getLeaveRequestsData を使用してください。",
  )
  try {
    const supabase = getClientSupabase()

    // 休暇申請データを取得
    const { data: leaveRequests, error: leaveError } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (leaveError) throw leaveError

    if (!leaveRequests || leaveRequests.length === 0) {
      return []
    }

    // スタッフIDのリストを作成
    const staffIds = [...new Set(leaveRequests.map((request) => request.staff_id).filter(Boolean))]

    // スタッフデータを別途取得
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("id, full_name")
      .in("id", staffIds)

    if (staffError) throw staffError

    // スタッフIDをキーとしたマップを作成
    const staffMap = new Map()
    staffData?.forEach((staff) => {
      staffMap.set(staff.id, staff.full_name)
    })

    // データ形式を整形
    return leaveRequests.map((request) => ({
      ...request,
      staff: {
        name: staffMap.get(request.staff_id) || "不明",
      },
    }))
  } catch (error) {
    console.error("休暇申請データ取得エラー:", error)
    throw error
  }
}

// 休暇申請を更新する関数
export async function updateLeaveRequest({
  id,
  status,
  rejectReason,
}: {
  id: string
  status: "approved" | "rejected"
  rejectReason?: string
}) {
  console.warn(
    "updateLeaveRequest は非推奨です。代わりに lib/supabase-utils.ts の updateLeaveRequestData を使用してください。",
  )
  try {
    const supabase = getClientSupabase()

    const { error } = await supabase
      .from("leave_requests")
      .update({
        status,
        reject_reason: rejectReason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      throw new Error(`休暇申請更新エラー: ${error.message}`)
    }

    return { id, status }
  } catch (error) {
    console.error("休暇申請更新エラー:", error)
    throw error
  }
}

// 承認された休暇申請から休暇データを追加
export async function addVacationFromApprovedRequest(approvedRequest: any) {
  console.warn("addVacationFromApprovedRequest は非推奨です。代わりに lib/supabase-utils.ts の関数を使用してください。")
  try {
    const supabase = getClientSupabase()

    // 休暇申請を承認済みに更新
    const { error } = await supabase
      .from("leave_requests")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", approvedRequest.id)

    if (error) {
      throw new Error(`休暇申請更新エラー: ${error.message}`)
    }

    return { id: approvedRequest.id, status: "approved" }
  } catch (error) {
    console.error("休暇データ追加エラー:", error)
    throw error
  }
}

// 休暇種類の名前を取得
export function getLeaveTypeName(type: string) {
  console.warn("getLeaveTypeName は非推奨です。代わりに lib/supabase-utils.ts の getLeaveTypeName を使用してください。")
  switch (type) {
    case "paid":
      return "有給"
    case "compensatory":
      return "振替休日"
    case "special":
      return "特別休暇"
    case "absent":
      return "欠勤"
    default:
      return type
  }
}

// 作業日報データの取得
export async function getDailyReports() {
  console.warn(
    "getDailyReports は非推奨です。代わりに lib/supabase-utils.ts の getDailyReportsData を使用してください。",
  )
  try {
    const supabase = getClientSupabase()

    // 日報データを取得
    const { data: reports, error } = await supabase
      .from("daily_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!reports || reports.length === 0) {
      return []
    }

    // スタッフIDとプロジェクトIDのリストを作成
    const staffIds = [...new Set(reports.map((report: any) => report.staff_id).filter(Boolean))]
    const projectIds = [...new Set(reports.map((report: any) => report.project_id).filter(Boolean))]

    // スタッフデータを取得
    const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

    if (staffError) throw staffError

    // プロジェクトデータを取得
    const { data: projectsData, error: projectError } = await supabase.from("projects").select("id, name")

    if (projectError) throw projectError

    // スタッフIDとプロジェクトIDをキーとしたマップを作成
    const staffMap = new Map()
    staffData?.forEach((staff: any) => {
      staffMap.set(staff.id, staff.full_name)
    })

    const projectMap = new Map()
    projectsData?.forEach((project: any) => {
      projectMap.set(project.id, project.name)
    })

    // データ形式を整形
    return reports.map((report: any) => ({
      ...report,
      userName: staffMap.get(report.staff_id) || "不明",
      projectName: projectMap.get(report.project_id) || "不明",
      workDate: report.work_date,
      createdAt: report.created_at,
    }))
  } catch (error) {
    console.error("作業日報データ取得エラー:", error)
    throw error
  }
}
