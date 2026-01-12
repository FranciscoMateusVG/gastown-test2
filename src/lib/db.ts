import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'app.db')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const db = new Database(DB_PATH)

// Create items table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
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
