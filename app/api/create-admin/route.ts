import { createAdminUser } from "@/actions/create-admin-user"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await createAdminUser()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `API Error: ${error.message}`,
        debug: { error: error.toString() },
      },
      { status: 500 },
    )
  }
}
