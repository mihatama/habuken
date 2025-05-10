"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { Toaster } from "@/components/ui/toaster"
import { DealsNotificationHandler } from "@/components/deals-notification-handler"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
        <DealsNotificationHandler />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
