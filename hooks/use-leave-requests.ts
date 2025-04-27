import { useSupabaseQuery, useSupabaseMutation } from "./use-supabase-query"
import { getLeaveRequests, updateLeaveRequest } from "@/lib/data-utils"

// 休暇申請データを取得するカスタムフック
export function useLeaveRequests() {
  return useSupabaseQuery(["leave-requests"], async (client) => {
    return getLeaveRequests(client)
  })
}

// スタッフデータを取得するカスタムフック
export function useStaff() {
  return useSupabaseQuery(["staff"], async (client) => {
    const { data } = await client.from("staff").select("*")
    return data || []
  })
}

// 休暇申請を追加するカスタムフック
export function useAddLeaveRequest() {
  return useSupabaseMutation(["leave-requests"], async (client, newRequest) => {
    const { data, error } = await client
      .from("leave_requests")
      .insert({
        staff_id: newRequest.userId,
        leave_type: newRequest.leaveType,
        start_date: newRequest.startDate,
        end_date: newRequest.endDate,
        reason: newRequest.reason,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error
    return data
  })
}

// 休暇申請を更新するカスタムフック
export function useUpdateLeaveRequest() {
  return useSupabaseMutation(["leave-requests"], async (client, request) => {
    await updateLeaveRequest(request, client)
    return true
  })
}
