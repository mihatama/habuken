"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function RotatingLogo() {
  // 回転アニメーションの設定
  // 非常にゆっくりから始まり、加速度的に速度を上げていく
  const rotationVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 2520, // 7回転 (360 × 7)
      transition: {
        duration: 3.5,
        // 加速度的なイージング - 指数関数的に加速
        ease: [0.1, 0.01, 0.3, 0.99],
        // アニメーションのタイミング制御
        // 非常に細かく分割して、より滑らかな加速を実現
        times: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
      },
    },
  }

  return (
    <motion.div variants={rotationVariants} initial="initial" animate="animate" className="relative h-40 w-40">
      <Image src="/favicon.ico" alt="現助ロゴ" width={160} height={160} className="rounded-full" priority />
    </motion.div>
  )
}
