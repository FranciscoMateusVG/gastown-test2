import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = process.env.TEST_DB ? 'test.db' : 'app.db'
const DB_PATH = path.join(DATA_DIR, DB_FILE)

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const db = new Database(DB_PATH)

// Create tables if they don't exist
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

  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`)

export interface Item {
  id: number
  name: string
  created_at: string
}

export function getAllItems(): Item[] {
  return db.prepare('SELECT * FROM items ORDER BY created_at DESC').all() as Item[]
}

export function getItemById(id: number): Item | undefined {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Item | undefined
}

export function createItem(name: string): Item {
  const result = db.prepare('INSERT INTO items (name) VALUES (?)').run(name)
  return getItemById(result.lastInsertRowid as number)!
}

export function deleteItem(id: number): boolean {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id)
  return result.changes > 0
}

// User types and functions
export interface User {
  id: number
  email: string
  password_hash: string
  created_at: string
}

export interface Session {
  id: number
  user_id: number
  token: string
  expires_at: string
  created_at: string
}

export function getUserByEmail(email: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined
}

export function createUser(email: string, passwordHash: string): User {
  const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash)
  return getUserById(result.lastInsertRowid as number)!
}

export function createSession(userId: number, token: string, expiresAt: Date): Session {
  const expiresAtStr = expiresAt.toISOString()
  const result = db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, token, expiresAtStr)
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid) as Session
}

export function getSessionByToken(token: string): Session | undefined {
  return db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')").get(token) as Session | undefined
}

export function deleteSession(token: string): boolean {
  const result = db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  return result.changes > 0
}

export function cleanExpiredSessions(): number {
  const result = db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run()
  return result.changes
}
