import { NextRequest, NextResponse } from 'next/server'
import { getItemById, deleteItem } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id, 10)

  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid ID' },
      { status: 400 }
    )
  }

  const item = getItemById(id)

  if (!item) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(item)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id, 10)

  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid ID' },
      { status: 400 }
    )
  }

  const deleted = deleteItem(id)

  if (!deleted) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}
