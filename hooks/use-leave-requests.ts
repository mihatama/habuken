import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { updateLeaveRequest } from "../lib/data-utils"
import { getClientSupabase } from "../lib/supabase-utils"
import { v4 as uuidv4 } from "uuid"

// 休暇申請データを取得するカスタムフック
export function useLeaveRequests() {
  return useQuery({
    queryKey: ["leaveRequests"],
    queryFn: async () => {
      try {
        // 1. スタッフデータを取得
        const supabase = getClientSupabase()
        const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name")

        if (staffError) {
          console.error("スタッフデータ取得エラー:", staffError)
          throw staffError
        }

        // スタッフデータをIDをキーとしたオブジェクトに変換
        const staffLookup: Record<string, any> = {}
        staffData?.forEach((staff) => {
          staffLookup[staff.id] = staff
        })

        // 2. 休暇データを取得（スタッフとの結合なし）
        const { data: leaveData, error: leaveError } = await supabase
          .from("leave_requests")
          .select(
            "id, staff_id, start_date, end_date, reason, status, leave_type, reject_reason, created_at, updated_at",
          )
          .order("start_date", { ascending: false })

        if (leaveError) {
          console.error("休暇データ取得エラー:", leaveError)
          throw leaveError
        }

        // 取得したデータにスタッフ情報を追加
        return (
          leaveData?.map((leave) => ({
            ...leave,
            staff: staffLookup[leave.staff_id] || { full_name: "不明" },
          })) || []
        )
      } catch (error) {
        console.error("休暇申請データの取得に失敗しました:", error)
        throw error
      }
    },
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
