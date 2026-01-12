import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db module
vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

// Mock auth module
vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn(),
  createUserSession: vi.fn(),
  setSessionCookie: vi.fn(),
  sanitizeUser: vi.fn((user) => {
    const { password_hash, ...rest } = user
    return rest
  }),
}))

import { POST } from './route'
import { getUserByEmail, createUser } from '@/lib/db'
import { hashPassword, createUserSession, setSessionCookie } from '@/lib/auth'

const mockedGetUserByEmail = vi.mocked(getUserByEmail)
const mockedCreateUser = vi.mocked(createUser)
const mockedHashPassword = vi.mocked(hashPassword)
const mockedCreateUserSession = vi.mocked(createUserSession)
const mockedSetSessionCookie = vi.mocked(setSessionCookie)

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/register', () => {
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

  it('should return 400 when email format is invalid', async () => {
    const request = createRequest({ email: 'invalid-email', password: 'password123' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email format')
  })

  it('should return 400 when password is too short', async () => {
    const request = createRequest({ email: 'test@example.com', password: '12345' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password must be at least 6 characters')
  })

  it('should return 409 when email already exists', async () => {
    mockedGetUserByEmail.mockReturnValue({
      id: 1,
      email: 'existing@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })

    const request = createRequest({ email: 'existing@example.com', password: 'password123' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Email already registered')
  })

  it('should register successfully with valid input', async () => {
    const mockUser = {
      id: 1,
      email: 'new@example.com',
      password_hash: 'hashed_password',
      created_at: '2024-01-01',
    }
    mockedGetUserByEmail.mockReturnValue(undefined)
    mockedHashPassword.mockResolvedValue('hashed_password')
    mockedCreateUser.mockReturnValue(mockUser)
    mockedCreateUserSession.mockReturnValue('session-token-123')
    mockedSetSessionCookie.mockResolvedValue(undefined)

    const request = createRequest({ email: 'new@example.com', password: 'password123' })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user).toEqual({
      id: 1,
      email: 'new@example.com',
      created_at: '2024-01-01',
    })
    expect(mockedHashPassword).toHaveBeenCalledWith('password123')
    expect(mockedCreateUser).toHaveBeenCalledWith('new@example.com', 'hashed_password')
    expect(mockedCreateUserSession).toHaveBeenCalledWith(1)
    expect(mockedSetSessionCookie).toHaveBeenCalledWith('session-token-123')
  })

  it('should normalize email to lowercase and trim', async () => {
    mockedGetUserByEmail.mockReturnValue(undefined)
    mockedHashPassword.mockResolvedValue('hash')
    mockedCreateUser.mockReturnValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })
    mockedCreateUserSession.mockReturnValue('token')
    mockedSetSessionCookie.mockResolvedValue(undefined)

    const request = createRequest({ email: '  TEST@EXAMPLE.COM  ', password: 'password123' })

    await POST(request)

    expect(mockedGetUserByEmail).toHaveBeenCalledWith('test@example.com')
    expect(mockedCreateUser).toHaveBeenCalledWith('test@example.com', 'hash')
  })

  it('should accept password with exactly 6 characters', async () => {
    mockedGetUserByEmail.mockReturnValue(undefined)
    mockedHashPassword.mockResolvedValue('hash')
    mockedCreateUser.mockReturnValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })
    mockedCreateUserSession.mockReturnValue('token')
    mockedSetSessionCookie.mockResolvedValue(undefined)

    const request = createRequest({ email: 'test@example.com', password: '123456' })

    const response = await POST(request)

    expect(response.status).toBe(201)
  })
})
