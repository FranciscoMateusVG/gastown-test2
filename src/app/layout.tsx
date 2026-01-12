import type { Metadata } from 'next'
import './globals.css'
import ShootingStars from '@/components/ShootingStars'
import { Providers } from '@/components/Providers'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-slate-800 dark:text-slate-100 overflow-x-hidden">
        <ThemeProvider>
          <Providers>
            <ShootingStars />
            <ThemeToggle />
            <div className="relative z-10 min-h-screen">
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
