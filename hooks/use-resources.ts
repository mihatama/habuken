import { useQuery } from "@tanstack/react-query"
import { getClientSupabase } from "@/lib/supabase-utils"

// Hook to fetch staff data from Supabase
export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      console.log("Fetching staff from Supabase...")
      const supabase = getClientSupabase()

      const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

      if (error) {
        console.error("Error fetching staff:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} staff members from database`)
      return data || []
    },
  })
}

// Hook to fetch heavy machinery data from Supabase
export function useHeavyMachinery() {
  return useQuery({
    queryKey: ["heavy_machinery"],
    queryFn: async () => {
      console.log("Fetching heavy machinery from Supabase...")
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_type", "重機")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching heavy machinery:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} heavy machinery items from database`)
      return data || []
    },
  })
}

// Hook to fetch vehicles data from Supabase
export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      console.log("Fetching vehicles from Supabase...")
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_type", "車両")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching vehicles:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} vehicles from database`)
      return data || []
    },
  })
}

// Hook to fetch tools data from Supabase
export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      console.log("Fetching tools from Supabase...")
      const supabase = getClientSupabase()

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_type", "工具")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching tools:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} tools from database`)
      return data || []
    },
  })
}
