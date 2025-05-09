import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { PATCH } from "@/app/api/master/staff/order/route"

// モックの設定
vi.mock("next/headers", () => ({
  cookies: () => ({
    getAll: () => [],
    get: () => null,
  }),
}))

vi.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: "test-user-id" } } } })),
    },
    rpc: vi.fn(() => Promise.resolve({ error: null })),
  })),
}))

describe("Staff Order API", () => {
  let req: NextRequest

  beforeEach(() => {
    req = new NextRequest("http://localhost:3000/api/master/staff/order", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: ["id1", "id2", "id3"],
      }),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should update staff order successfully", async () => {
    const response = await PATCH(req)
    expect(response).toBeInstanceOf(NextResponse)

    const data = await response.json()
    expect(data).toEqual({ success: true })
  })

  it("should return 400 if ids array is empty", async () => {
    req = new NextRequest("http://localhost:3000/api/master/staff/order", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: [],
      }),
    })

    const response = await PATCH(req)
    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty("error")
  })
})
