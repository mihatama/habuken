"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DealEditForm } from "@/components/deal-edit-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getClientSupabase } from "@/lib/supabase-utils"
import { toast } from "@/components/ui/use-toast"

interface DealEditPageProps {
  id: string
}

export function DealEditPage({ id }: DealEditPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dealExists, setDealExists] = useState(false)
  const [dealName, setDealName] = useState("")

  useEffect(() => {
    async function checkDealExists() {
      try {
        setLoading(true)
        const supabase = getClientSupabase()
        const { data, error } = await supabase.from("deals").select("name").eq("id", id).single()

        if (error) {
          throw error
        }

        if (data) {
          setDealExists(true)
          setDealName(data.name)
        } else {
          setDealExists(false)
        }
      } catch (error) {
        console.error("現場確認エラー:", error)
        setDealExists(false)
      } finally {
        setLoading(false)
      }
    }

    checkDealExists()
  }, [id])

  const handleSuccess = () => {
    toast({
      title: "更新完了",
      description: "現場情報が正常に更新されました。",
    })
    router.push("/deals")
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!dealExists) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">現場が見つかりません</h2>
        <p className="mb-6">指定された現場は存在しないか、アクセス権限がありません。</p>
        <Button onClick={() => router.push("/deals")}>現場一覧に戻る</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            詳細に戻る
          </Button>
          <h1 className="text-2xl font-bold">現場を編集</h1>
        </div>
      </div>

      <DealEditForm dealId={id} onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
