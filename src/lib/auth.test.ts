import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before importing auth
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Mock db functions
vi.mock('./db', () => ({
  createSession: vi.fn(),
  getSessionByToken: vi.fn(),
  deleteSession: vi.fn(),
  getUserById: vi.fn(),
}))

import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  createUserSession,
  sanitizeUser,
} from './auth'
import { createSession } from './db'

const mockedCreateSession = vi.mocked(createSession)

describe('hashPassword', () => {
  it('should return a hashed string different from the original', async () => {
    const password = 'mySecurePassword123'
    const hashed = await hashPassword(password)

    expect(hashed).toBeDefined()
    expect(hashed).not.toBe(password)
    expect(hashed.length).toBeGreaterThan(0)
  })

  it('should produce different hashes for the same password (due to salt)', async () => {
    const password = 'mySecurePassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })

  it('should handle empty string', async () => {
    const hashed = await hashPassword('')
    expect(hashed).toBeDefined()
    expect(hashed.length).toBeGreaterThan(0)
  })
})

describe('verifyPassword', () => {
  it('should return true for matching password and hash', async () => {
    const password = 'correctPassword123'
    const hashed = await hashPassword(password)

    const result = await verifyPassword(password, hashed)

    expect(result).toBe(true)
  })

  it('should return false for non-matching password', async () => {
    const password = 'correctPassword123'
    const wrongPassword = 'wrongPassword456'
    const hashed = await hashPassword(password)

    const result = await verifyPassword(wrongPassword, hashed)

    expect(result).toBe(false)
  })

  it('should return false for empty password against valid hash', async () => {
    const password = 'correctPassword123'
    const hashed = await hashPassword(password)

    const result = await verifyPassword('', hashed)

    expect(result).toBe(false)
  })

  it('should handle special characters in password', async () => {
    const password = 'p@$$w0rd!#$%^&*()'
    const hashed = await hashPassword(password)

    const result = await verifyPassword(password, hashed)

    expect(result).toBe(true)
  })
})

describe('generateSessionToken', () => {
  it('should return a string with UUID format', () => {
    const token = generateSessionToken()

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    // Two UUIDs joined by hyphen
    expect(token).toMatch(/^[0-9a-f-]+-[0-9a-f-]+$/)
  })

  it('should generate unique tokens on each call', () => {
    const token1 = generateSessionToken()
    const token2 = generateSessionToken()

    expect(token1).not.toBe(token2)
  })
})

describe('createUserSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a session and return a token', () => {
    const userId = 1
    mockedCreateSession.mockReturnValue({
      id: 1,
      user_id: userId,
      token: 'mock-token',
      expires_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    const token = createUserSession(userId)

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(mockedCreateSession).toHaveBeenCalledTimes(1)
    expect(mockedCreateSession).toHaveBeenCalledWith(
      userId,
      expect.any(String),
      expect.any(Date)
    )
  })

  it('should create session with expiry date in the future', () => {
    const userId = 1
    mockedCreateSession.mockReturnValue({
      id: 1,
      user_id: userId,
      token: 'mock-token',
      expires_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })

    createUserSession(userId)

    const callArgs = mockedCreateSession.mock.calls[0]
    const expiresAt = callArgs[2] as Date
    const now = new Date()

    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime())
  })
})

describe('sanitizeUser', () => {
  it('should remove password_hash from user object', () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'secret_hash_value',
      created_at: '2024-01-01T00:00:00Z',
    }

    const sanitized = sanitizeUser(user)

    expect(sanitized).toEqual({
      id: 1,
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    })
    expect('password_hash' in sanitized).toBe(false)
  })

  it('should preserve all other user properties', () => {
    const user = {
      id: 42,
      email: 'another@test.com',
      password_hash: 'hash123',
      created_at: '2024-06-15T12:30:00Z',
    }

    const sanitized = sanitizeUser(user)

    expect(sanitized.id).toBe(42)
    expect(sanitized.email).toBe('another@test.com')
    expect(sanitized.created_at).toBe('2024-06-15T12:30:00Z')
  })
})
