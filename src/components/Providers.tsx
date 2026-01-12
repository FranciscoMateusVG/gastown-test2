'use client'

import { ReactNode } from 'react'
import { ToastProvider } from './ToastContext'
import { ToastContainer } from './Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  )
}
