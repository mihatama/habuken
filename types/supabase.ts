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
          skills?: string[] | null
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
          skills?: string[] | null
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
          skills?: string[] | null
        }
      }
      deals: {
        Row: {
          id: string
          name: string
          client_name: string | null
          start_date: string
          end_date: string | null
          description: string | null
          location: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client_name?: string | null
          start_date: string
          end_date?: string | null
          description?: string | null
          location?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client_name?: string | null
          start_date?: string
          end_date?: string | null
          description?: string | null
          location?: string | null
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      deal_staff: {
        Row: {
          id: string
          deal_id: string
          staff_id: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          staff_id: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          staff_id?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deal_machinery: {
        Row: {
          id: string
          deal_id: string
          machinery_id: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          machinery_id: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          machinery_id?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deal_vehicles: {
        Row: {
          id: string
          deal_id: string
          vehicle_id: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          vehicle_id: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          vehicle_id?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deal_tools: {
        Row: {
          id: string
          deal_id: string
          tool_id: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          tool_id: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          tool_id?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deal_periods: {
        Row: {
          id: string
          deal_id: string
          start_date: string
          end_date: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          start_date: string
          end_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          start_date?: string
          end_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          project_id: string
          deal_id: string | null
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
          deal_id?: string | null
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
          deal_id?: string | null
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
      // 他のテーブル定義は省略
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

export type Deal = Database["public"]["Tables"]["deals"]["Row"]
export type DealStaff = Database["public"]["Tables"]["deal_staff"]["Row"]
export type DealMachinery = Database["public"]["Tables"]["deal_machinery"]["Row"]
export type DealVehicle = Database["public"]["Tables"]["deal_vehicles"]["Row"]
export type DealTool = Database["public"]["Tables"]["deal_tools"]["Row"]
export type DealPeriod = Database["public"]["Tables"]["deal_periods"]["Row"]
export type Staff = Database["public"]["Tables"]["staff"]["Row"]
