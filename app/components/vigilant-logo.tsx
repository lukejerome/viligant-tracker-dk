import Image from "next/image"

interface VigilantLogoProps {
  size?: number
  className?: string
}

export default function VigilantLogo({ size = 32, className = "" }: VigilantLogoProps) {
  return (
    <Image
      src="/images/vigilant-logo.png"
      alt="Vigilant Fitness Tracker"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  )
}
