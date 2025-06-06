"use client"

import Image from "next/image"

interface ViligantLogoProps {
  size?: number
  className?: string
}

export default function ViligantLogo({ size = 32, className = "" }: ViligantLogoProps) {
  return (
    <Image
      src="/images/viligant-logo.png"
      alt="Viligant Fitness Tracker"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  )
}
