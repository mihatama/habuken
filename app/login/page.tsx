import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "ログイン - 羽舞建設",
  description: "羽舞建設の工事管理システムにログインします。",
}

export default function LoginPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image src="/habuken-logo.png" alt="羽舞建設ロゴ" width={40} height={40} className="mr-2" />
          羽舞建設
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">「安全第一、品質第一」をモットーに、お客様の夢を形にする建設会社です。</p>
            <footer className="text-sm">羽舞建設株式会社</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">アカウントにログイン</h1>
            <p className="text-sm text-muted-foreground">メールアドレスとパスワードを入力してください</p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            アカウントをお持ちでない場合は{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              新規登録
            </Link>
            してください。
          </p>
        </div>
      </div>
    </div>
  )
}
