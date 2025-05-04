import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Noto_Serif_JP } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { Providers } from "./providers"
import { SplashProvider } from "@/contexts/splash-context"
import { SplashScreen } from "@/components/splash-screen"
import { AppShell } from "@/components/app-shell"
import { PWARegister } from "./pwa-register"

const inter = Inter({ subsets: ["latin"] })
const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kaisho",
})

export const metadata: Metadata = {
  title: "現助 - 建設業向け業務管理システム",
  description: "スケジュール管理、シフト管理、日報・安全パトロール記録など、建設業に特化した業務管理システムです。",
  manifest: "/manifest.json",
  themeColor: "#4a90e2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "現助",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "現助",
    "apple-mobile-web-app-title": "現助",
    "msapplication-TileColor": "#4a90e2",
    "msapplication-tap-highlight": "no",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#4a90e2" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} ${notoSerifJP.variable}`}>
        <Providers>
          <AuthProvider>
            <SplashProvider>
              <SplashScreen />
              <AppShell>{children}</AppShell>
              <PWARegister />
            </SplashProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
