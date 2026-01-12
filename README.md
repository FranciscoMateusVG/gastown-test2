# Items App

A minimal Next.js app with TypeScript, Tailwind CSS, and SQLite.

## Features

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS for styling
- SQLite database (auto-created on first request)
- CRUD API for items
- Cookie-based authentication with server-side sessions

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Auth Flow

This app uses cookie-based authentication with server-side sessions stored in SQLite.

### How it works:
1. **Registration/Login**: Users submit email + password via `/auth` page
2. **Session Creation**: Server creates a session in SQLite, sets HttpOnly cookie
3. **Route Protection**: Middleware checks for session cookie on protected routes
4. **API Protection**: All item API endpoints validate the session before processing
5. **Logout**: Clears cookie and deletes session from database

### Security Features:
- Passwords hashed with bcrypt (10 salt rounds)
- HttpOnly cookies (not accessible via JavaScript)
- Secure flag in production
- SameSite=Lax protection
- Sessions expire after 7 days

### Creating a User

1. Start the dev server: `pnpm dev`
2. Navigate to `http://localhost:3000`
3. You'll be redirected to `/auth` (login page)
4. Click "Create account" to switch to signup mode
5. Enter email and password (min 6 characters)
6. Click "Continue" to register and login

### Logging In

1. Navigate to `http://localhost:3000/auth`
2. Enter your registered email and password
3. Click "Continue" to login
4. You'll be redirected to the items page

## API Routes

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Authenticate and get session |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get current user |

### Item Endpoints (auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items |
| POST | `/api/items` | Create item (body: `{ "name": "..." }`) |
| GET | `/api/items/:id` | Get item by ID |
| DELETE | `/api/items/:id` | Delete item by ID |

## SQLite Database

The database file is automatically created at `./data/app.db` on the first API request.

Tables are auto-created:

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Items table
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Toast Notifications

The app includes a lightweight toast notification system built with React Context. Toasts appear in the bottom-right corner and auto-dismiss after 3 seconds.

### Usage

Import and use the `useToast` hook in any client component:

```tsx
import { useToast } from '@/components/ToastContext'

function MyComponent() {
  const { addToast } = useToast()

  const handleAction = () => {
    addToast('Action completed', 'success')
  }

  return <button onClick={handleAction}>Do something</button>
}
```

### Toast Types

- `success` - Green, for successful operations
- `error` - Red, for errors and failures
- `info` - Blue, for informational messages

### Components

- `ToastContext.tsx` - Context provider and `useToast` hook
- `Toast.tsx` - Toast container and individual toast rendering
- `Providers.tsx` - Client-side provider wrapper

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/       # Auth API routes (login, logout, register, me)
│   │   │   └── items/      # Items API routes
│   │   ├── auth/           # Auth page (login/signup)
│   │   ├── globals.css     # Tailwind + animations
│   │   ├── layout.tsx      # Root layout with providers
│   │   └── page.tsx        # Items page (protected)
│   ├── components/
│   │   ├── Providers.tsx   # Client providers wrapper
│   │   ├── ShootingStars.tsx # Background animation
│   │   ├── ThemeProvider.tsx # Dark mode context
│   │   ├── ThemeToggle.tsx # Dark mode toggle button
│   │   ├── Toast.tsx       # Toast UI component
│   │   └── ToastContext.tsx # Toast state management
│   ├── lib/
│   │   ├── auth.ts         # Auth utilities (password, sessions)
│   │   └── db.ts           # SQLite database functions
│   └── middleware.ts       # Route protection middleware
├── data/
│   └── app.db              # SQLite database (auto-created)
└── package.json
```
