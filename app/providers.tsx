"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <PWAInstallPrompt />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
