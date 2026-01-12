import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/db'
import { verifyPassword, createUserSession, setSessionCookie, sanitizeUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()

    const user = getUserByEmail(emailLower)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const validPassword = await verifyPassword(password, user.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = createUserSession(user.id)
    await setSessionCookie(token)

    return NextResponse.json({ user: sanitizeUser(user) })
  } catch {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
