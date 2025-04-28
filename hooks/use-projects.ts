import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/supabaseClient"

// プロジェクトの型定義
export type Project = {
  id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  status: "未着手" | "計画中" | "進行中" | "完了"
  client?: string
  location?: string
  created_by: string
  created_at: string
  updated_at: string
}

// プロジェクト入力の型定義
export type ProjectInput = Omit<Project, "id" | "created_at" | "updated_at" | "created_by">

/**
 * プロジェクト一覧を取得するカスタムフック
 */
export function useProjects(
  options: {
    filters?: Record<string, any>
    enabled?: boolean
    searchTerm?: string
  } = {},
) {
  const { filters, searchTerm } = options

  return useQuery({
    queryKey: ["projects", filters, searchTerm],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase.from("projects").select("*")

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            query = query.eq(key, value)
          }
        })
      }

      query = query.order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      // 検索語句でフィルタリング（クライアント側）
      if (searchTerm) {
        const lowercaseSearchTerm = searchTerm.toLowerCase()
        return data.filter(
          (project) =>
            project.name.toLowerCase().includes(lowercaseSearchTerm) ||
            (project.description && project.description.toLowerCase().includes(lowercaseSearchTerm)) ||
            (project.client && project.client.toLowerCase().includes(lowercaseSearchTerm)),
        )
      }

      return data
    },
    ...options,
  })
}

/**
 * プロジェクトを作成するカスタムフック
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const supabase = getSupabaseClient()

      // プロジェクトを作成
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status,
          client: data.client,
          location: data.location,
          created_by: data.created_by,
        })
        .select()

      if (projectError) throw projectError

      // 割り当てがある場合は処理
      if (data.assignments && data.assignments.length > 0 && projectData && projectData.length > 0) {
        const projectId = projectData[0].id

        // 割り当てを作成
        for (const assignment of data.assignments) {
          const assignmentData = {
            project_id: projectId,
            ...assignment,
          }

          const { error: assignmentError } = await supabase.from("project_assignments").insert(assignmentData)

          if (assignmentError) {
            console.error("割り当て作成エラー:", assignmentError)
          }
        }
      }

      return projectData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast({
        title: "成功",
        description: "プロジェクトを作成しました",
      })
    },
    onError: (error) => {
      console.error("プロジェクト作成エラー:", error)
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました",
        variant: "destructive",
      })
    },
  })
}

/**
 * プロジェクトを更新するカスタムフック
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase
        .from("projects")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        throw error
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast({
        title: "成功",
        description: "プロジェクトを更新しました",
      })
    },
    onError: (error) => {
      console.error("プロジェクト更新エラー:", error)
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました",
        variant: "destructive",
      })
    },
  })
}

/**
 * プロジェクトを削除するカスタムフック
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()

      // まず関連する割り当てを削除
      const { error: assignmentError } = await supabase.from("project_assignments").delete().eq("project_id", id)

      if (assignmentError) {
        console.error("割り当て削除エラー:", assignmentError)
      }

      // プロジェクトを削除
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) {
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast({
        title: "成功",
        description: "プロジェクトを削除しました",
      })
    },
    onError: (error) => {
      console.error("プロジェクト削除エラー:", error)
      toast({
        title: "エラー",
        description: "プロジェクトの削除に失敗しました",
        variant: "destructive",
      })
    },
  })
}

/**
 * プロジェクトの詳細を取得するカスタムフック
 */
export function useProjectDetail(projectId: string, options = {}) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const supabase = getSupabaseClient()

      // プロジェクト基本情報を取得
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projectError) throw projectError

      // プロジェクトの割り当てを取得
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("project_assignments")
        .select("*")
        .eq("project_id", projectId)

      if (assignmentsError) throw assignmentsError

      // 関連データを取得（スタッフ、重機、車両、備品）
      const staffIds = assignmentsData.filter((a) => a.staff_id).map((a) => a.staff_id)

      const heavyMachineryIds = assignmentsData.filter((a) => a.heavy_machinery_id).map((a) => a.heavy_machinery_id)

      const vehicleIds = assignmentsData.filter((a) => a.vehicle_id).map((a) => a.vehicle_id)

      const toolIds = assignmentsData.filter((a) => a.tool_id).map((a) => a.tool_id)

      // 関連データを取得
      const [staffResult, heavyMachineryResult, vehicleResult, toolResult] = await Promise.all([
        staffIds.length > 0 ? supabase.from("staff").select("*").in("id", staffIds) : { data: [] },
        heavyMachineryIds.length > 0
          ? supabase.from("heavy_machinery").select("*").in("id", heavyMachineryIds)
          : { data: [] },
        vehicleIds.length > 0 ? supabase.from("vehicles").select("*").in("id", vehicleIds) : { data: [] },
        toolIds.length > 0 ? supabase.from("tools").select("*").in("id", toolIds) : { data: [] },
      ])

      return {
        ...projectData,
        staff: staffResult.data || [],
        heavyMachinery: heavyMachineryResult.data || [],
        vehicles: vehicleResult.data || [],
        tools: toolResult.data || [],
        assignments: assignmentsData,
      }
    },
    ...options,
  })
}
