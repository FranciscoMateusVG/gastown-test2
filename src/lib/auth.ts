import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { createSession, getSessionByToken, deleteSession, getUserById, User } from './db'

const SALT_ROUNDS = 10
const SESSION_COOKIE_NAME = 'session_token'
const SESSION_DURATION_DAYS = 7

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID()
}

export function createUserSession(userId: number): string {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  createSession(userId, token, expiresAt)
  return token
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionToken()
  if (!token) return null

  const session = getSessionByToken(token)
  if (!session) return null

  const user = getUserById(session.user_id)
  return user || null
}

export async function logout(): Promise<void> {
  const token = await getSessionToken()
  if (token) {
    deleteSession(token)
  }
  await clearSessionCookie()
}

export type SafeUser = Omit<User, 'password_hash'>

export function sanitizeUser(user: User): SafeUser {
  const { password_hash, ...safeUser } = user
  return safeUser
}
