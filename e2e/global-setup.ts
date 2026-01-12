import fs from 'fs'
import path from 'path'

export default async function globalSetup() {
  const testDbPath = path.join(process.cwd(), 'data', 'test.db')

  // Remove test database before running tests for clean state
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath)
  }
}
