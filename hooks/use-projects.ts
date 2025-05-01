import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProjects, createProject, updateProject, deleteProject } from "@/actions/projects"

// Hook to fetch projects from Supabase
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("Fetching projects from Supabase...")
      const result = await getProjects()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch projects")
      }

      console.log(`Successfully fetched ${result.data?.length || 0} projects from database`)
      return result.data || []
    },
  })
}

// Hook to create a new project in Supabase
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectData: any) => {
      console.log("Creating new project in Supabase:", projectData)
      const result = await createProject(projectData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create project")
      }

      console.log("Project created successfully:", result.data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// Hook to update a project in Supabase
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log("Updating project in Supabase:", id, data)
      const result = await updateProject(id, data)

      if (!result.success) {
        throw new Error(result.error || "Failed to update project")
      }

      console.log("Project updated successfully:", result.data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// Hook to delete a project from Supabase
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting project from Supabase:", id)
      const result = await deleteProject(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete project")
      }

      console.log("Project deleted successfully")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}
