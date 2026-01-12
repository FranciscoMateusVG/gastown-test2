# Items App

A minimal Next.js app with TypeScript, Tailwind CSS, and SQLite.

## Features

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS for styling
- SQLite database (auto-created on first request)
- CRUD API for items

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items |
| POST | `/api/items` | Create item (body: `{ "name": "..." }`) |
| GET | `/api/items/:id` | Get item by ID |
| DELETE | `/api/items/:id` | Delete item by ID |

## SQLite Database

The database file is automatically created at `./data/app.db` on the first API request.

The `items` table schema:
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/items/      # API routes
│   │   ├── globals.css     # Tailwind imports
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page (UI)
│   └── lib/
│       └── db.ts           # SQLite database functions
├── data/
│   └── app.db              # SQLite database (auto-created)
└── package.json
```
