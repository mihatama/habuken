import { fetchData, insertData, deleteData } from "@/lib/supabase-client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { getClientSupabase } from "@/lib/supabase/client"

// スタッフデータの取得
export async function getStaff(client?: SupabaseClient<Database>) {
  const { data } = await fetchData("staff", {
    order: { column: "full_name", ascending: true },
    client,
  })

  return data
}

// スタッフの削除
export async function deleteStaff(id: string, client?: SupabaseClient<Database>) {
  return deleteData("staff", id, { client })
}

// プロジェクトデータの取得
export async function getProjects(client?: SupabaseClient<Database>) {
  const { data } = await fetchData("projects", {
    order: { column: "name", ascending: true },
    client,
  })

  return data
}

// 工具データの取得
export async function getTools(client?: SupabaseClient<Database>) {
  try {
    // まず、resourcesテーブルのスキーマを確認するためにデータを1件取得
    const { data: columns } = await fetchData("resources", { limit: 1, client })

    // テーブルにtype列がある場合
    if (columns && columns.length > 0 && "type" in columns[0]) {
      const { data } = await fetchData("resources", {
        filters: { type: "工具" },
        order: { column: "name", ascending: true },
        client,
      })

      return data
    }

    // テーブルにresource_type列がある場合
    else if (columns && columns.length > 0 && "resource_type" in columns[0]) {
      const { data } = await fetchData("resources", {
        filters: { resource_type: "工具" },
        order: { column: "name", ascending: true },
        client,
      })

      return data
    }

    // どちらの列もない場合は、全てのリソースを取得
    else {
      const { data } = await fetchData("resources", {
        order: { column: "name", ascending: true },
        client,
      })

      return data
    }
  } catch (error) {
    console.error("工具データ取得エラー:", error)
    throw error
  }
}

// 休暇データの取得
export async function getVacations(client?: SupabaseClient<Database>) {
  try {
    const { data } = await fetchData("vacations", {
      select: `
        id,
        staff_id,
        date,
        type,
        staff:staff_id (
          id,
          full_name
        )
      `,
      order: { column: "date", ascending: false },
      client,
    })

    // データを整形
    return data.map((item: any) => ({
      id: item.id,
      staffId: item.staff_id,
      staffName: item.staff?.full_name || "不明",
      date: new Date(item.date),
      type: item.type,
    }))
  } catch (error) {
    console.error("休暇データ取得エラー:", error)
    throw error
  }
}

// 休暇申請データを取得する関数 - リレーションシップを使用せずに修正
export async function getLeaveRequests(client = getClientSupabase()) {
  try {
    // まず休暇申請データを取得
    const { data: leaveRequests, error: leaveError } = await client
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
    const { data: staffData, error: staffError } = await client.from("staff").select("id, full_name").in("id", staffIds)

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
export async function updateLeaveRequest(
  request: { id: string; status: "approved" | "rejected"; rejectReason?: string },
  client = getClientSupabase(),
) {
  const { error } = await client
    .from("leave_requests")
    .update({
      status: request.status,
      reject_reason: request.rejectReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id)

  if (error) {
    console.error("休暇申請更新エラー:", error)
    throw error
  }

  return true
}

// 承認された休暇申請から休暇データを追加
export async function addVacationFromApprovedRequest(approvedRequest: any, client?: SupabaseClient<Database>) {
  // 開始日から終了日までの各日を追加
  const startDate = new Date(approvedRequest.startDate)
  const endDate = new Date(approvedRequest.endDate)
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    try {
      // 休暇データを追加
      await insertData(
        "vacations",
        {
          staff_id: approvedRequest.userId,
          date: new Date(currentDate).toISOString().split("T")[0],
          type: getLeaveTypeName(approvedRequest.leaveType),
          created_at: new Date().toISOString(),
        },
        { client },
      )
    } catch (error) {
      console.error("休暇データ追加エラー:", error)
      // エラーがあっても処理を続行
    }

    // 次の日に進める
    currentDate.setDate(currentDate.getDate() + 1)
  }
}

// 休暇種類の名前を取得
export function getLeaveTypeName(type: string) {
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
export async function getDailyReports(client?: SupabaseClient<Database>) {
  try {
    // 日報データを取得
    const { data: reports } = await fetchData("daily_reports", {
      order: { column: "created_at", ascending: false },
      client,
    })

    if (!reports || reports.length === 0) {
      return []
    }

    // スタッフIDとプロジェクトIDのリストを作成
    const staffIds = [...new Set(reports.map((report: any) => report.staff_id).filter(Boolean))]
    const projectIds = [...new Set(reports.map((report: any) => report.project_id).filter(Boolean))]

    // スタッフデータを取得
    const { data: staffData } = await fetchData("staff", {
      select: "id, full_name",
      client,
    })

    // プロジェクトデータを取得
    const { data: projectsData } = await fetchData("projects", {
      select: "id, name",
      client,
    })

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
