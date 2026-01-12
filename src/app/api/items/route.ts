import { NextRequest, NextResponse } from 'next/server'
import { getAllItems, createItem } from '@/lib/db'

export async function GET() {
  const items = getAllItems()
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 }
    )
  }

  const item = createItem(body.name.trim())
  return NextResponse.json(item, { status: 201 })
}
