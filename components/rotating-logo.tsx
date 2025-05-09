"use client"

import Image from "next/image"

export function RotatingLogo() {
  return (
    <div className="relative w-40 h-40 animate-fade-in-blur">
      <Image src="/habukensetsu-togo.png" alt="羽布建設ロゴ" fill className="object-contain" priority />
    </div>
  )
}
