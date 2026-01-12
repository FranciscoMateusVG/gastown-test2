'use client'

import { useState, useEffect } from 'react'
import {
  Input,
  Button,
  Alert,
  Card,
  CardHeader,
  CardFooter,
  Spinner,
  EmptyState,
} from '@/components/ui'

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
        <Card>
          <CardHeader title="Items" description="Manage your collection" />

          {error && (
            <Alert variant="error" onDismiss={() => setError('')} className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-3">
              <Input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="What needs to be added?"
                disabled={submitting}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newItemName.trim()}
                loading={submitting}
              >
                Add
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" className="text-slate-500" />
                <p className="mt-3 text-sm text-slate-500">Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                title="No items yet"
                description="Add your first item above"
              />
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-700/30 px-4 py-3 glass-card-interactive"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-white truncate">{item.name}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        #{item.id}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      loading={deletingId === item.id}
                      className="ml-3 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Delete ${item.name}`}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!loading && items.length > 0 && (
            <CardFooter>
              <p className="text-xs text-slate-500 text-center">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  )
}
