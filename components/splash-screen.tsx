"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSplash } from "@/contexts/splash-context"
import { RotatingLogo } from "./rotating-logo"

export function SplashScreen() {
  const { showSplash, hideSplash } = useSplash()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // タップでスキップする機能
  const handleSkip = () => {
    hideSplash()
  }

  if (!showSplash) return null

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleSkip}
        >
          <RotatingLogo />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
