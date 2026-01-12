'use client'

import { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  interactive?: boolean
  className?: string
}

export default function Card({
  children,
  interactive = false,
  className = '',
}: CardProps) {
  return (
    <div
      className={`
        glass-card rounded-2xl p-8 shadow-2xl shadow-black/20
        ${interactive ? 'glass-card-interactive' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  title: string
  description?: string
  className?: string
}

export function CardHeader({ title, description, className = '' }: CardHeaderProps) {
  return (
    <header className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      )}
    </header>
  )
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-slate-700/30 ${className}`}>
      {children}
    </div>
  )
}
