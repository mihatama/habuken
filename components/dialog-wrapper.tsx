"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { enableDialogScroll } from "@/lib/dialog-utils"

interface DialogWrapperProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  allowBackgroundScroll?: boolean
}

export function DialogWrapper({
  isOpen,
  onClose,
  title,
  children,
  className,
  allowBackgroundScroll = false,
}: DialogWrapperProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // ダイアログが開いたときにスクロールを制御
  useEffect(() => {
    if (allowBackgroundScroll && isOpen) {
      // 背景のスクロールを許可する場合、bodyのスクロールロックを解除
      const dialogElement = document.querySelector('[role="dialog"]')
      if (dialogElement) {
        dialogElement.setAttribute("data-allow-background-scroll", "true")
      }
    }

    // ダイアログ内のスクロールを有効にする
    if (isOpen && dialogRef.current) {
      enableDialogScroll(dialogRef)
    }

    return () => {
      // クリーンアップ
      if (allowBackgroundScroll) {
        const dialogElement = document.querySelector('[role="dialog"]')
        if (dialogElement) {
          dialogElement.removeAttribute("data-allow-background-scroll")
        }
      }
    }
  }, [isOpen, allowBackgroundScroll])

  return (
    <div ref={dialogRef}>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={cn("overflow-hidden", className)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="dialog-scroll-fix">{children}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
