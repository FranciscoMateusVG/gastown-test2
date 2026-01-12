import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock auth module
vi.mock('@/lib/auth', () => ({
  logout: vi.fn(),
}))

import { POST } from './route'
import { logout } from '@/lib/auth'

const mockedLogout = vi.mocked(logout)

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return success when logout succeeds', async () => {
    mockedLogout.mockResolvedValue(undefined)

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockedLogout).toHaveBeenCalledTimes(1)
  })

  it('should return 500 when logout fails', async () => {
    mockedLogout.mockRejectedValue(new Error('Logout failed'))

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to logout')
  })
})
