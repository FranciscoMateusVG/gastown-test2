import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'session_token'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Public paths that don't require auth
  const isAuthPath = pathname === '/auth'
  const isApiAuthPath = pathname.startsWith('/api/auth')
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  // Allow API auth routes and public assets
  if (isApiAuthPath || isPublicAsset) {
    return NextResponse.next()
  }

  // If on /auth and has session, redirect to home
  if (isAuthPath && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If on protected route without session, redirect to /auth
  if (!isAuthPath && !sessionToken) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
