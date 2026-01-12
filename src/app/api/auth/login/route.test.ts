import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db module
vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
}))

// Mock auth module
vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  createUserSession: vi.fn(),
  setSessionCookie: vi.fn(),
  sanitizeUser: vi.fn((user) => {
    const { password_hash, ...rest } = user
    return rest
  }),
}))

import { POST } from './route'
import { getUserByEmail } from '@/lib/db'
import { verifyPassword, createUserSession, setSessionCookie } from '@/lib/auth'

const mockedGetUserByEmail = vi.mocked(getUserByEmail)
const mockedVerifyPassword = vi.mocked(verifyPassword)
const mockedCreateUserSession = vi.mocked(createUserSession)
const mockedSetSessionCookie = vi.mocked(setSessionCookie)

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when email is missing', async () => {
    const request = createRequest({ password: 'password123' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
  })

  it('should return 400 when password is missing', async () => {
    const request = createRequest({ email: 'test@example.com' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email and password are required')
  })

  it('should return 400 when email is not a string', async () => {
    const request = createRequest({ email: 123, password: 'password123' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid input')
  })

  it('should return 401 when user does not exist', async () => {
    mockedGetUserByEmail.mockReturnValue(undefined)

    const request = createRequest({ email: 'notfound@example.com', password: 'password123' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 401 when password is incorrect', async () => {
    mockedGetUserByEmail.mockReturnValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed_password',
      created_at: '2024-01-01',
    })
    mockedVerifyPassword.mockResolvedValue(false)

    const request = createRequest({ email: 'test@example.com', password: 'wrongpassword' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed_password',
      created_at: '2024-01-01',
    }
    mockedGetUserByEmail.mockReturnValue(mockUser)
    mockedVerifyPassword.mockResolvedValue(true)
    mockedCreateUserSession.mockReturnValue('session-token-123')
    mockedSetSessionCookie.mockResolvedValue(undefined)

    const request = createRequest({ email: 'test@example.com', password: 'correctpassword' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual({
      id: 1,
      email: 'test@example.com',
      created_at: '2024-01-01',
    })
    expect(mockedCreateUserSession).toHaveBeenCalledWith(1)
    expect(mockedSetSessionCookie).toHaveBeenCalledWith('session-token-123')
  })

  it('should normalize email to lowercase', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed_password',
      created_at: '2024-01-01',
    }
    mockedGetUserByEmail.mockReturnValue(mockUser)
    mockedVerifyPassword.mockResolvedValue(true)
    mockedCreateUserSession.mockReturnValue('token')
    mockedSetSessionCookie.mockResolvedValue(undefined)

    const request = createRequest({ email: '  TEST@EXAMPLE.COM  ', password: 'password' })

    await POST(request)

    expect(mockedGetUserByEmail).toHaveBeenCalledWith('test@example.com')
  })
})
