"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export default function Loading() {
  const [opacity, setOpacity] = useState(0)
  const [blur, setBlur] = useState(10)

  useEffect(() => {
    // Start the animation after component mounts
    const timer = setTimeout(() => {
      setOpacity(1)
      setBlur(0)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-container-padding">
      <AnimatePresence>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{
              opacity: opacity,
              filter: `blur(${blur}px)`,
            }}
            transition={{
              opacity: { duration: 1.2, ease: "easeOut" },
              filter: { duration: 1.5, ease: "easeOut" },
            }}
            className="relative w-48 h-48 mx-auto mb-6"
          >
            <Image src="/habukensetsu-togo.png" alt="羽布建設" fill className="object-contain" priority />
          </motion.div>

          <motion.h2
            className="text-heading-md font-semibold mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            読み込み中...
          </motion.h2>

          <motion.p
            className="text-body text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            データを取得しています。しばらくお待ちください。
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
