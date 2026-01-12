import type { Metadata } from 'next'
import './globals.css'
import ShootingStars from '@/components/ShootingStars'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Items',
  description: 'Simple CRUD app with SQLite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen text-slate-100 overflow-x-hidden">
        <Providers>
          <ShootingStars />
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
