'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500/50',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500/50',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/50',
  ghost: 'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white focus:ring-slate-500/50',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-3 font-medium',
  lg: 'px-6 py-4 text-lg font-medium',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          rounded-lg transition-all
          focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${isDisabled ? 'hover:bg-inherit' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {loading ? <Spinner size={size === 'sm' ? 'sm' : 'md'} /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
