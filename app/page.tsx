import { Suspense } from "react"
import Loading from "./loading"
import { redirect } from "next/navigation"

export default function Home() {
  // ルートパスにアクセスした場合は、ログインページにリダイレクト
  redirect("/login")

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">羽舞建設</h1>
        <p className="mt-4 text-xl">工事管理システム</p>
      </div>
    </Suspense>
  )
}
