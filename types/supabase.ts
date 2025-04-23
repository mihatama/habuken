export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          position: string | null
          department: string | null
          phone: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          position?: string | null
          department?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          position?: string | null
          department?: string | null
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          position: string | null
          department: string | null
          phone: string | null
          email: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          position?: string | null
          department?: string | null
          phone?: string | null
          email?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          position?: string | null
          department?: string | null
          phone?: string | null
          email?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          name: string
          type: string
          status: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          status?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          status?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          project_id: string
          staff_id: string | null
          resource_id: string | null
          start_time: string
          end_time: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          staff_id?: string | null
          resource_id?: string | null
          start_time: string
          end_time: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          staff_id?: string | null
          resource_id?: string | null
          start_time?: string
          end_time?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          staff_id: string
          start_date: string
          end_date: string
          reason: string | null
          status: string
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          start_date: string
          end_date: string
          reason?: string | null
          status?: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          status?: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          project_id: string
          report_date: string
          weather: string | null
          temperature: number | null
          work_description: string
          issues: string | null
          submitted_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          report_date: string
          weather?: string | null
          temperature?: number | null
          work_description: string
          issues?: string | null
          submitted_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          report_date?: string
          weather?: string | null
          temperature?: number | null
          work_description?: string
          issues?: string | null
          submitted_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      safety_inspections: {
        Row: {
          id: string
          project_id: string
          inspection_date: string
          inspector: string
          location: string
          findings: string
          action_items: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          inspection_date: string
          inspector: string
          location: string
          findings: string
          action_items?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          inspection_date?: string
          inspector?: string
          location?: string
          findings?: string
          action_items?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Staff = Database["public"]["Tables"]["staff"]["Row"]
export type Resource = Database["public"]["Tables"]["resources"]["Row"]
