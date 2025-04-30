import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Noto_Serif_JP } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { DebugNavigation } from "@/components/debug-navigation"

const inter = Inter({ subsets: ["latin"] })
const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kaisho",
})

export const metadata: Metadata = {
  title: "現助 - 建設業向け業務管理システム",
  description: "スケジュール管理、シフト管理、日報・安全パトロール記録など、建設業に特化した業務管理システムです。",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} ${notoSerifJP.variable}`}>
        <Providers>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex-1 pt-16">{children}</div>
              <DebugNavigation />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
