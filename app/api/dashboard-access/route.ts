import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      return NextResponse.json(
        {
          authenticated: false,
          error: error.message,
          timestamp: new Date().toISOString(),
          cookies: cookieStore.getAll().map((c) => c.name),
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        last_sign_in: data.user.last_sign_in_at,
      },
      timestamp: new Date().toISOString(),
      cookies: cookieStore.getAll().map((c) => c.name),
    })
  } catch (err) {
    console.error("Dashboard access API error:", err)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
