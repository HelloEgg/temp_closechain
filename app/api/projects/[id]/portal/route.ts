import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [portal] = await sql`
      SELECT * FROM client_portals
      WHERE project_id = ${id} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `
    return NextResponse.json(portal || null)
  } catch (error) {
    console.error('GET portal error:', error)
    return NextResponse.json({ error: 'Failed to fetch portal' }, { status: 500 })
  }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Deactivate any existing portals
    await sql`UPDATE client_portals SET is_active = false WHERE project_id = ${id}`
    // Create new portal
    const [portal] = await sql`
      INSERT INTO client_portals (project_id)
      VALUES (${id})
      RETURNING *
    `
    return NextResponse.json(portal, { status: 201 })
  } catch (error) {
    console.error('POST portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal' }, { status: 500 })
  }
}
