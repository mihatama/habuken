import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLeaveRequests, updateLeaveRequest } from "../lib/data-utils"
import { getClientSupabase } from "../lib/supabase-utils"
import { v4 as uuidv4 } from "uuid"

// 休暇申請データを取得するカスタムフック
export function useLeaveRequests() {
  return useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => getLeaveRequests(),
  })
}

// スタッフデータを取得するカスタムフック
export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const supabase = getClientSupabase()
      const { data, error } = await supabase.from("staff").select("*").order("full_name")
      if (error) throw error
      return data
    },
  })
}

// 休暇申請を追加するカスタムフック
export function useAddLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRequest: {
      userId: string
      leaveType: string
      startDate: string
      endDate: string
      reason: string
    }) => {
      const supabase = getClientSupabase()

      // スタッフIDを取得
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id")
        .eq("user_id", newRequest.userId)
        .single()

      if (staffError) {
        // ユーザーIDとスタッフIDが同じと仮定
        console.warn("スタッフデータ取得エラー、ユーザーIDをスタッフIDとして使用します:", staffError)
      }

      const staffId = staffData?.id || newRequest.userId

      const { error } = await supabase.from("leave_requests").insert({
        id: uuidv4(),
        staff_id: staffId,
        leave_type: newRequest.leaveType,
        start_date: newRequest.startDate,
        end_date: newRequest.endDate,
        reason: newRequest.reason,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] })
    },
  })
}

// 休暇申請を更新するカスタムフック
export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] })
    },
  })
}
