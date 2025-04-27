import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// スタッフデータの取得
export async function getStaff() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

  if (error) {
    console.error("スタッフデータ取得エラー:", error)
    throw error
  }

  return data || []
}

// スタッフの削除
export async function deleteStaff(id: string) {
  const supabase = createClientComponentClient()
  const { error } = await supabase.from("staff").delete().eq("id", id)

  if (error) {
    console.error("スタッフ削除エラー:", error)
    throw error
  }

  return true
}

// プロジェクトデータの取得
export async function getProjects() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.from("projects").select("*").order("name", { ascending: true })

  if (error) {
    console.error("プロジェクトデータ取得エラー:", error)
    throw error
  }

  return data || []
}

// 工具データの取得
export async function getTools() {
  const supabase = createClientComponentClient()
  try {
    // まず、resourcesテーブルのスキーマを確認
    const { data: columns, error: schemaError } = await supabase.from("resources").select("*").limit(1)

    if (schemaError) throw schemaError

    // テーブルにtype列がある場合
    if (columns && columns.length > 0 && "type" in columns[0]) {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("type", "工具")
        .order("name", { ascending: true })

      if (error) throw error
      return data || []
    }

    // テーブルにresource_type列がある場合
    else if (columns && columns.length > 0 && "resource_type" in columns[0]) {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_type", "工具")
        .order("name", { ascending: true })

      if (error) throw error
      return data || []
    }

    // どちらの列もない場合は、全てのリソースを取得
    else {
      const { data, error } = await supabase.from("resources").select("*").order("name", { ascending: true })

      if (error) throw error
      return data || []
    }
  } catch (error) {
    console.error("工具データ取得エラー:", error)
    throw error
  }
}

// 休暇申請データの取得
export async function getLeaveRequests() {
  const supabase = createClientComponentClient()

  try {
    // まず休暇申請データを取得
    const { data: leaveRequests, error: leaveRequestsError } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (leaveRequestsError) {
      console.error("休暇申請データ取得エラー:", leaveRequestsError)
      throw leaveRequestsError
    }

    // スタッフIDのリストを作成
    const staffIds = [...new Set(leaveRequests.map((request) => request.staff_id))]

    // スタッフデータを取得
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("id, full_name")
      .in("id", staffIds)

    if (staffError) {
      console.error("スタッフデータ取得エラー:", staffError)
      throw staffError
    }

    // スタッフIDをキーとしたマップを作成
    const staffMap = new Map()
    staffData?.forEach((staff) => {
      staffMap.set(staff.id, staff.full_name)
    })

    // データ形式を整形
    return (leaveRequests || []).map((request) => ({
      ...request,
      userName: staffMap.get(request.staff_id) || "不明",
    }))
  } catch (error) {
    console.error("休暇申請データ取得エラー:", error)
    throw error
  }
}

// 休暇申請の更新
export async function updateLeaveRequest(updatedRequest: any) {
  const supabase = createClientComponentClient()
  const { error } = await supabase
    .from("leave_requests")
    .update({
      status: updatedRequest.status,
      reject_reason: updatedRequest.rejectReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updatedRequest.id)

  if (error) {
    console.error("休暇申請更新エラー:", error)
    throw error
  }

  // 承認された場合、休暇データを追加
  if (updatedRequest.status === "approved") {
    await addVacationFromApprovedRequest(updatedRequest)
  }

  return true
}

// 承認された休暇申請から休暇データを追加
export async function addVacationFromApprovedRequest(approvedRequest: any) {
  const supabase = createClientComponentClient()

  // 開始日から終了日までの各日を追加
  const startDate = new Date(approvedRequest.startDate)
  const endDate = new Date(approvedRequest.endDate)
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // 休暇データを追加
    const { error } = await supabase.from("vacations").insert({
      staff_id: approvedRequest.userId,
      date: new Date(currentDate).toISOString().split("T")[0],
      type: getLeaveTypeName(approvedRequest.leaveType),
      created_at: new Date().toISOString(),
    })

    if (error) {
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
export async function getDailyReports() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from("daily_reports")
    .select("*, staff(full_name), projects(name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("作業日報データ取得エラー:", error)
    throw error
  }

  // データ形式を整形
  return (data || []).map((report) => ({
    ...report,
    userName: report.staff?.full_name || "不明",
    projectName: report.projects?.name || "不明",
    workDate: new Date(report.work_date),
    createdAt: new Date(report.created_at),
  }))
}
