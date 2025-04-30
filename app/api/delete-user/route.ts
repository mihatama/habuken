import { deleteUserAndReferences } from "@/actions/delete-user"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, message: "ユーザーIDが指定されていません" }, { status: 400 })
    }

    const result = await deleteUserAndReferences(userId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `API Error: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
