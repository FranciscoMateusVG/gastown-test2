'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastContext'

interface Item {
  id: number
  name: string
  created_at: string
}

// Skeleton component for loading state
function ItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-200/30 dark:bg-slate-800/30 border border-slate-300/30 dark:border-slate-700/30 px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-4 bg-slate-300/50 dark:bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-3 bg-slate-300/30 dark:bg-slate-700/30 rounded w-8"></div>
      </div>
      <div className="h-6 bg-slate-300/30 dark:bg-slate-700/30 rounded w-14"></div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { addToast } = useToast()

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/auth')
        router.refresh()
      } else {
        addToast('Failed to logout', 'error')
      }
    } catch {
      addToast('Failed to logout', 'error')
    } finally {
      setLoggingOut(false)
    }
  }

  const fetchItems = async () => {
    setFetchError(false)
    setLoading(true)
    try {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setItems(data)
    } catch {
      setFetchError(true)
      addToast('Failed to fetch items', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || submitting) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName }),
      })

      if (res.ok) {
        setNewItemName('')
        addToast('Item created', 'success')
        fetchItems()
      } else {
        addToast('Failed to create item', 'error')
      }
    } catch {
      addToast('Failed to create item', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (deletingId) return

    setDeletingId(id)

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (res.ok) {
        addToast('Item deleted', 'success')
        fetchItems()
      } else {
        addToast('Failed to delete item', 'error')
      }
    } catch {
      addToast('Failed to delete item', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <header className="mb-6 sm:mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Items
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your collection
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/50 disabled:opacity-50"
            >
              {loggingOut ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Logout'
              )}
            </button>
          </header>

          {/* Add Form */}
          <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="What needs to be added?"
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 input-focus transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting || !newItemName.trim()}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Add'
                )}
              </button>
            </div>
          </form>

          {/* Items List */}
          <div className="space-y-2 sm:space-y-3">
            {loading ? (
              // Loading Skeletons
              <div className="space-y-2">
                <ItemSkeleton />
                <ItemSkeleton />
                <ItemSkeleton />
              </div>
            ) : fetchError ? (
              // Error State with Retry
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                <div className="rounded-full bg-red-500/10 p-4 mb-4">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">Something went wrong</p>
                <p className="text-sm text-slate-500 mb-4">We couldn&apos;t load your items</p>
                <button
                  onClick={fetchItems}
                  className="rounded-lg bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300/50 dark:border-slate-600/50 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-300/50 dark:hover:bg-slate-700 hover:border-slate-400/50 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <div className="relative rounded-full bg-gradient-to-br from-slate-200 dark:from-slate-800 to-slate-200/50 dark:to-slate-800/50 p-5 border border-slate-300/50 dark:border-slate-700/50">
                    <svg className="h-10 w-10 text-slate-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">Your collection is empty</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Start by adding your first item using the form above
                </p>
              </div>
            ) : (
              // Items
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center justify-between rounded-xl bg-slate-100/30 dark:bg-slate-800/30 border border-slate-300/30 dark:border-slate-700/30 px-3 sm:px-4 py-3 glass-card-interactive"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="text-slate-900 dark:text-white truncate text-sm sm:text-base">{item.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">#{item.id}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="ml-2 sm:ml-3 rounded-lg px-2 sm:px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Delete ${item.name}`}
                    >
                      {deletingId === item.id ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {!loading && !fetchError && items.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-300/30 dark:border-slate-700/30">
              <p className="text-xs text-slate-500 text-center">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
