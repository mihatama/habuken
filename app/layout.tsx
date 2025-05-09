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
import { HideAddressBar } from "@/components/hide-address-bar"

const inter = Inter({ subsets: ["latin"] })
const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kaisho",
})

export const metadata: Metadata = {
  title: "Habuken - Project Management",
  description: "Construction project management system",
  icons: {
    icon: "/favicon.ico",
    apple: "/habuken-logo.png",
  },
  manifest: "/manifest.json",
  themeColor: "#4a90e2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "現助",
    // フルスクリーンモードを有効化
    startupImage: [
      {
        url: "/splash/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1536-2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    // iOS用のビューポート設定
    viewportFit: "cover",
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
    // iOS用のステータスバー設定
    "apple-mobile-web-app-status-bar-style": "black-translucent",
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} ${notoSerifJP.variable}`}>
        <Providers>
          <AuthProvider>
            <SplashProvider>
              <SplashScreen />
              <HideAddressBar />
              <AppShell>{children}</AppShell>
              <PWARegister />
            </SplashProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
