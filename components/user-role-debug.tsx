"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function UserRoleDebug() {
  const { user, session } = useAuth()

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>ユーザー情報デバッグ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">ユーザーID:</h3>
          <p className="text-sm">{user?.id || "取得できません"}</p>
        </div>

        <div>
          <h3 className="font-semibold">メールアドレス:</h3>
          <p className="text-sm">{user?.email || "取得できません"}</p>
        </div>

        <div>
          <h3 className="font-semibold">ユーザーロール:</h3>
          <Badge variant={user?.user_metadata?.role === "admin" ? "destructive" : "outline"}>
            {user?.user_metadata?.role || "取得できません"}
          </Badge>
        </div>

        <div>
          <h3 className="font-semibold">メタデータ (JSON):</h3>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(user?.user_metadata, null, 2) || "取得できません"}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">セッション有効:</h3>
          <Badge variant={session ? "success" : "destructive"}>{session ? "有効" : "無効"}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
