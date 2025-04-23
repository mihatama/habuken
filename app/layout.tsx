import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter, Noto_Serif_JP } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
