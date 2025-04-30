import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm">
        <LoginForm />
      </div>
    </div>
  )
}
