"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AnimatePresence, motion } from "framer-motion"

interface ScrollAreaWithHintProps extends React.ComponentPropsWithoutRef<typeof ScrollArea> {
  showScrollHint?: boolean
  hintText?: string
  className?: string
  children: React.ReactNode
}

export function ScrollAreaWithHint({
  showScrollHint = false,
  hintText = "→ 右にスライド",
  className,
  children,
  ...props
}: ScrollAreaWithHintProps) {
  const [showHint, setShowHint] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 横スクロールが必要かどうかを検出
  useEffect(() => {
    if (!showScrollHint || !scrollContainerRef.current) return

    const checkOverflow = () => {
      const element = scrollContainerRef.current
      if (!element) return

      // スクロール幅がクライアント幅より大きい場合、スクロールが必要
      const isOverflowing = element.scrollWidth > element.clientWidth
      setShowHint(isOverflowing && !hasScrolled)
    }

    // 初期チェック
    checkOverflow()

    // リサイズ時にも再チェック
    window.addEventListener("resize", checkOverflow)
    return () => window.removeEventListener("resize", checkOverflow)
  }, [showScrollHint, hasScrolled])

  // スクロールイベントを監視
  useEffect(() => {
    const element = scrollContainerRef.current
    if (!element) return

    const handleScroll = () => {
      if (element.scrollLeft > 10 && !hasScrolled) {
        setHasScrolled(true)
        setShowHint(false)
      }
    }

    element.addEventListener("scroll", handleScroll)
    return () => element.removeEventListener("scroll", handleScroll)
  }, [hasScrolled])

  return (
    <div className="relative">
      <ScrollArea
        className={className}
        {...props}
        ref={(node) => {
          // スクロールコンテナの参照を取得
          if (node) {
            // @ts-ignore - ScrollArea の内部実装に依存
            scrollContainerRef.current = node.querySelector("[data-radix-scroll-area-viewport]")
          }
        }}
      >
        {children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <AnimatePresence>
        {showHint && (
          <motion.div
            className="scroll-hint"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {hintText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
