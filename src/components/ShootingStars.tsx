'use client'

import { useEffect, useState } from 'react'

interface Star {
  id: number
  top: number
  left: number
  delay: number
  duration: number
  size: number
}

export default function ShootingStars() {
  const [stars, setStars] = useState<Star[]>([])
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)

    // Generate stars with random positions and timings
    const generated: Star[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      top: Math.random() * 60, // Keep in upper portion
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 3 + Math.random() * 4, // 3-7 seconds
      size: 1 + Math.random() * 1.5, // 1-2.5px
    }))
    setStars(generated)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (reducedMotion) {
    // Static subtle dots for reduced motion
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
        {stars.slice(0, 6).map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white/20"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" />

      {/* Shooting stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="shooting-star absolute"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
    </div>
  )
}
