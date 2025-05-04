"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { SyncProvider } from "./sync-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SyncProvider>
          {children}
          <PWAInstallPrompt />
        </SyncProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
