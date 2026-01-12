import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the auth module first
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

// Mock the db module
vi.mock('@/lib/db', () => ({
  getAllItems: vi.fn(),
  createItem: vi.fn(),
}))

import { GET, POST } from './route'
import { getAllItems, createItem } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const mockedGetAllItems = vi.mocked(getAllItems)
const mockedCreateItem = vi.mocked(createItem)
const mockedGetCurrentUser = vi.mocked(getCurrentUser)

describe('GET /api/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return empty array when no items exist', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })
    mockedGetAllItems.mockReturnValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
    expect(mockedGetAllItems).toHaveBeenCalledTimes(1)
  })

  it('should return all items when authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })
    const mockItems = [
      { id: 1, name: 'Item 1', created_at: '2024-01-01' },
      { id: 2, name: 'Item 2', created_at: '2024-01-02' },
    ]
    mockedGetAllItems.mockReturnValue(mockItems)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockItems)
    expect(mockedGetAllItems).toHaveBeenCalledTimes(1)
  })
})

describe('POST /api/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Item' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should create item with valid name when authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })
    const newItem = { id: 1, name: 'New Item', created_at: '2024-01-01' }
    mockedCreateItem.mockReturnValue(newItem)

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Item' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(newItem)
    expect(mockedCreateItem).toHaveBeenCalledWith('New Item')
  })

  it('should trim whitespace from name', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })
    const newItem = { id: 1, name: 'Trimmed', created_at: '2024-01-01' }
    mockedCreateItem.mockReturnValue(newItem)

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: '  Trimmed  ' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockedCreateItem).toHaveBeenCalledWith('Trimmed')
  })

  it('should return 400 when name is missing', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required')
    expect(mockedCreateItem).not.toHaveBeenCalled()
  })

  it('should return 400 when name is empty string', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required')
  })

  it('should return 400 when name is only whitespace', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required')
  })

  it('should return 400 when name is not a string', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: '2024-01-01',
    })

    const request = new NextRequest('http://localhost/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 123 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name is required')
  })
})
