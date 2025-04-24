import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"

export default async function Home() {
  // Server-side redirect using Next.js App Router
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect based on authentication status
  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  // This won't be reached due to the redirects above
  return null
}
