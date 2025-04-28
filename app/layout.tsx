import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Serif_JP } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { SupabaseCleanup } from "@/components/supabase-cleanup"

const inter = Inter({ subsets: ["latin"] })
const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kaisho",
})

export const metadata: Metadata = {
  title: "現助 - 建設業向け業務管理システム",
  description: "スケジュール管理、シフト管理、日報・安全パトロール記録など、建設業に特化した業務管理システム",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} ${notoSerifJP.variable}`}>
        <Providers>
          <SupabaseCleanup />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
              <MobileNav className="container py-2" />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
