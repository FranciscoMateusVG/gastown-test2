'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={`
          w-full rounded-lg bg-slate-800/50 border px-4 py-3
          text-white placeholder-slate-500
          input-focus transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500/50' : 'border-slate-700/50'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
