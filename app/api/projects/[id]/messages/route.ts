import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const messages = await sql`
      SELECT * FROM ai_messages
      WHERE project_id = ${id}
      ORDER BY created_at ASC
    `
    return NextResponse.json(messages)
  } catch (error) {
    console.error('GET messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { role, content } = await request.json()
    const [msg] = await sql`
      INSERT INTO ai_messages (project_id, role, content)
      VALUES (${id}, ${role}, ${content})
      RETURNING *
    `
    return NextResponse.json(msg, { status: 201 })
  } catch (error) {
    console.error('POST messages error:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}
