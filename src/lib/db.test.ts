import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test.db')

describe('Database operations', () => {
  let db: Database.Database

  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }

    db = new Database(TEST_DB_PATH)
    db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `)
  })

  afterEach(() => {
    db.close()
  })

  afterAll(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  describe('Item operations', () => {
    describe('getAllItems', () => {
      it('should return empty array when no items exist', () => {
        const items = db
          .prepare('SELECT * FROM items ORDER BY created_at DESC')
          .all()

        expect(items).toEqual([])
      })

      it('should return all items ordered by created_at descending', () => {
        // Insert with explicit timestamps to ensure ordering
        db.prepare('INSERT INTO items (name, created_at) VALUES (?, ?)').run('First Item', '2024-01-01 00:00:00')
        db.prepare('INSERT INTO items (name, created_at) VALUES (?, ?)').run('Second Item', '2024-01-02 00:00:00')

        const items = db
          .prepare('SELECT * FROM items ORDER BY created_at DESC')
          .all() as { id: number; name: string; created_at: string }[]

        expect(items).toHaveLength(2)
        expect(items[0].name).toBe('Second Item')
        expect(items[1].name).toBe('First Item')
      })
    })

    describe('getItemById', () => {
      it('should return undefined for non-existent id', () => {
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(999)

        expect(item).toBeUndefined()
      })

      it('should return the item for valid id', () => {
        const result = db.prepare('INSERT INTO items (name) VALUES (?)').run('Test Item')
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(
          result.lastInsertRowid
        ) as { id: number; name: string }

        expect(item).toBeDefined()
        expect(item.name).toBe('Test Item')
      })
    })

    describe('createItem', () => {
      it('should insert a new item and return it', () => {
        const result = db.prepare('INSERT INTO items (name) VALUES (?)').run('New Item')
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(
          result.lastInsertRowid
        ) as { id: number; name: string; created_at: string }

        expect(item).toBeDefined()
        expect(item.id).toBe(Number(result.lastInsertRowid))
        expect(item.name).toBe('New Item')
        expect(item.created_at).toBeDefined()
      })

      it('should auto-increment ids for multiple items', () => {
        const result1 = db.prepare('INSERT INTO items (name) VALUES (?)').run('Item 1')
        const result2 = db.prepare('INSERT INTO items (name) VALUES (?)').run('Item 2')

        expect(Number(result2.lastInsertRowid)).toBe(Number(result1.lastInsertRowid) + 1)
      })
    })

    describe('deleteItem', () => {
      it('should return 0 changes when item does not exist', () => {
        const result = db.prepare('DELETE FROM items WHERE id = ?').run(999)

        expect(result.changes).toBe(0)
      })

      it('should delete item and return 1 change when item exists', () => {
        const insertResult = db.prepare('INSERT INTO items (name) VALUES (?)').run('To Delete')
        const deleteResult = db.prepare('DELETE FROM items WHERE id = ?').run(
          insertResult.lastInsertRowid
        )

        expect(deleteResult.changes).toBe(1)

        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(
          insertResult.lastInsertRowid
        )
        expect(item).toBeUndefined()
      })

      it('should only delete the specified item', () => {
        db.prepare('INSERT INTO items (name) VALUES (?)').run('Keep This')
        const toDelete = db.prepare('INSERT INTO items (name) VALUES (?)').run('Delete This')
        db.prepare('INSERT INTO items (name) VALUES (?)').run('Keep This Too')

        db.prepare('DELETE FROM items WHERE id = ?').run(toDelete.lastInsertRowid)

        const items = db.prepare('SELECT * FROM items').all()
        expect(items).toHaveLength(2)
      })
    })
  })

  describe('User operations', () => {
    describe('getUserByEmail', () => {
      it('should return undefined for non-existent email', () => {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get('notfound@test.com')

        expect(user).toBeUndefined()
      })

      it('should return user for valid email', () => {
        db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
          'test@example.com',
          'hash123'
        )

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get('test@example.com') as {
          id: number
          email: string
          password_hash: string
        }

        expect(user).toBeDefined()
        expect(user.email).toBe('test@example.com')
        expect(user.password_hash).toBe('hash123')
      })

      it('should be case-sensitive for email lookup', () => {
        db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
          'test@example.com',
          'hash123'
        )

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get('TEST@EXAMPLE.COM')

        expect(user).toBeUndefined()
      })
    })

    describe('getUserById', () => {
      it('should return undefined for non-existent id', () => {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(999)

        expect(user).toBeUndefined()
      })

      it('should return user for valid id', () => {
        const result = db
          .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
          .run('test@example.com', 'hash123')

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as {
          id: number
          email: string
        }

        expect(user).toBeDefined()
        expect(user.email).toBe('test@example.com')
      })
    })

    describe('createUser', () => {
      it('should insert a new user', () => {
        const result = db
          .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
          .run('new@example.com', 'newhash')

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as {
          id: number
          email: string
          password_hash: string
          created_at: string
        }

        expect(user).toBeDefined()
        expect(user.email).toBe('new@example.com')
        expect(user.password_hash).toBe('newhash')
        expect(user.created_at).toBeDefined()
      })

      it('should reject duplicate emails', () => {
        db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
          'dupe@example.com',
          'hash1'
        )

        expect(() => {
          db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
            'dupe@example.com',
            'hash2'
          )
        }).toThrow()
      })
    })
  })

  describe('Session operations', () => {
    let testUserId: number

    beforeEach(() => {
      const result = db
        .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
        .run('session-test@example.com', 'hash')
      testUserId = Number(result.lastInsertRowid)
    })

    describe('createSession', () => {
      it('should create a new session', () => {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const result = db
          .prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
          .run(testUserId, 'test-token-123', expiresAt.toISOString())

        const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(
          result.lastInsertRowid
        ) as {
          id: number
          user_id: number
          token: string
          expires_at: string
        }

        expect(session).toBeDefined()
        expect(session.user_id).toBe(testUserId)
        expect(session.token).toBe('test-token-123')
      })

      it('should reject duplicate tokens', () => {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'duplicate-token',
          expiresAt.toISOString()
        )

        expect(() => {
          db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
            testUserId,
            'duplicate-token',
            expiresAt.toISOString()
          )
        }).toThrow()
      })
    })

    describe('getSessionByToken', () => {
      it('should return undefined for non-existent token', () => {
        const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get('nonexistent')

        expect(session).toBeUndefined()
      })

      it('should return session for valid token', () => {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'valid-token',
          expiresAt.toISOString()
        )

        const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get('valid-token') as {
          user_id: number
          token: string
        }

        expect(session).toBeDefined()
        expect(session.user_id).toBe(testUserId)
      })

      it('should return expired session when querying by token only', () => {
        // Use a date in the past (ISO format works with SQLite comparison)
        const expiredDate = '2020-01-01T00:00:00.000Z'

        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'expired-token',
          expiredDate
        )

        // Simple query returns expired session
        const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get('expired-token')
        expect(session).toBeDefined()

        // Query with expiry check returns undefined (expired date is before now)
        const validSession = db
          .prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')")
          .get('expired-token')
        expect(validSession).toBeUndefined()
      })
    })

    describe('deleteSession', () => {
      it('should return 0 changes when token does not exist', () => {
        const result = db.prepare('DELETE FROM sessions WHERE token = ?').run('nonexistent-token')

        expect(result.changes).toBe(0)
      })

      it('should delete session and return 1 change', () => {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'to-delete-token',
          expiresAt.toISOString()
        )

        const result = db.prepare('DELETE FROM sessions WHERE token = ?').run('to-delete-token')

        expect(result.changes).toBe(1)

        const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get('to-delete-token')
        expect(session).toBeUndefined()
      })
    })

    describe('cleanExpiredSessions', () => {
      it('should delete only expired sessions', () => {
        // Use explicit dates for reliable comparison
        const futureDate = '2099-01-01T00:00:00.000Z'
        const pastDate = '2020-01-01T00:00:00.000Z'

        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'valid-session',
          futureDate
        )
        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'expired-session-1',
          pastDate
        )
        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
          testUserId,
          'expired-session-2',
          pastDate
        )

        const result = db
          .prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')")
          .run()

        expect(result.changes).toBe(2)

        const remaining = db.prepare('SELECT * FROM sessions').all()
        expect(remaining).toHaveLength(1)
      })
    })
  })
})
