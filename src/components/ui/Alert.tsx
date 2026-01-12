'use client'

import { ReactNode } from 'react'

export interface AlertProps {
  variant: 'error' | 'success' | 'warning' | 'info'
  children: ReactNode
  onDismiss?: () => void
  className?: string
}

const variantStyles = {
  error: {
    container: 'bg-red-500/10 border-red-500/20',
    text: 'text-red-300',
    icon: 'text-red-400',
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-300',
    icon: 'text-emerald-400',
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-300',
    icon: 'text-amber-400',
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-300',
    icon: 'text-blue-400',
  },
}

const icons = {
  error: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  success: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  info: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
}

export default function Alert({
  variant,
  children,
  onDismiss,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${styles.container} ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <svg
          className={`h-4 w-4 flex-shrink-0 ${styles.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          {icons[variant]}
        </svg>
        <span className={`text-sm ${styles.text}`}>{children}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${styles.icon} hover:opacity-80 transition-opacity`}
          aria-label="Dismiss"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
