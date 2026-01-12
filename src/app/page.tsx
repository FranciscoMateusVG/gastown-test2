'use client'

import { useState, useEffect } from 'react'

interface Item {
  id: number
  name: string
  created_at: string
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items')
      const data = await res.json()
      setItems(data)
    } catch {
      setError('Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName }),
      })

      if (res.ok) {
        setNewItemName('')
        setSuccess('Item created')
        fetchItems()
      } else {
        setError('Failed to create item')
      }
    } catch {
      setError('Failed to create item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (deletingId) return

    setDeletingId(id)
    setError('')

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('Item deleted')
        fetchItems()
      } else {
        setError('Failed to delete item')
      }
    } catch {
      setError('Failed to delete item')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Items
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage your collection
            </p>
          </header>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-300">{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-emerald-300">{success}</span>
            </div>
          )}

          {/* Add Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="What needs to be added?"
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700/50 px-4 py-3 text-white placeholder-slate-500 input-focus transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting || !newItemName.trim()}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
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
          <div className="space-y-3">
            {loading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="h-8 w-8 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-slate-800/50 p-4 mb-4">
                  <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">No items yet</p>
                <p className="text-sm text-slate-500 mt-1">Add your first item above</p>
              </div>
            ) : (
              // Items
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-700/30 px-4 py-3 glass-card-interactive"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-white truncate">{item.name}</span>
                      <span className="text-xs text-slate-500 font-mono">#{item.id}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="ml-3 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
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
          {!loading && items.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-700/30">
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
