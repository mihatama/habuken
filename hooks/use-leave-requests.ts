import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getLeaveRequests, updateLeaveRequest } from "@/lib/data-utils"
import { getClientSupabase } from "@/lib/supabase/client"

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
      const { error } = await supabase.from("leave_requests").insert({
        staff_id: newRequest.userId,
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
