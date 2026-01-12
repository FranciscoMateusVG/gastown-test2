'use client'

import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'

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
  const { theme } = useTheme()

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

  const isDark = theme === 'dark'

  if (reducedMotion) {
    // Static subtle dots for reduced motion
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className={`absolute inset-0 transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100'
        }`} />
        {stars.slice(0, 6).map((star) => (
          <div
            key={star.id}
            className={`absolute rounded-full transition-colors duration-300 ${
              isDark ? 'bg-white/20' : 'bg-indigo-400/30'
            }`}
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
      <div className={`absolute inset-0 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
          : 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100'
      }`} />

      {/* Subtle radial glow */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl transition-colors duration-300 ${
        isDark ? 'bg-indigo-500/5' : 'bg-indigo-300/20'
      }`} />

      {/* Shooting stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute ${isDark ? 'shooting-star' : 'shooting-star-light'}`}
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
