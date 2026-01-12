import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock auth module
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  sanitizeUser: vi.fn((user) => {
    const { password_hash, ...rest } = user
    return rest
  }),
}))

import { GET } from './route'
import { getCurrentUser } from '@/lib/auth'

const mockedGetCurrentUser = vi.mocked(getCurrentUser)

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Not authenticated')
  })

  it('should return user when authenticated', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'secret_hash',
      created_at: '2024-01-01',
    }
    mockedGetCurrentUser.mockResolvedValue(mockUser)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual({
      id: 1,
      email: 'test@example.com',
      created_at: '2024-01-01',
    })
    expect(data.user.password_hash).toBeUndefined()
  })

  it('should return 500 when getCurrentUser throws', async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to get user')
  })
})
