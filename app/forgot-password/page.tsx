import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata: Metadata = {
  title: "パスワードをお忘れですか？",
  description: "パスワードリセットのためのメールを送信します",
}

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2">
        <Image src="/habuken-logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
        <span className="font-bold">プロジェクト管理クラウド</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">パスワードをリセット</h1>
          <p className="text-sm text-muted-foreground">
            登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
