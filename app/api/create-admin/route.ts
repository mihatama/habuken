import { createAdminUser } from "@/actions/create-admin-user"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await createAdminUser()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("管理者ユーザー作成APIエラー:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 },
    )
  }
}
