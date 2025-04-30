import { SimpleLoginForm } from "@/components/simple-login-form"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-6 mb-8">
        <h1 className="text-4xl font-bold">現助 - プロジェクト管理システム</h1>
        <p className="text-xl text-gray-600">建設現場の業務を効率化するプロジェクト管理ツール</p>
      </div>
      <SimpleLoginForm />
    </div>
  )
}
