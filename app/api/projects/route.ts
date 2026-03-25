import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects
      ORDER BY created_at DESC
    `
    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name, address, city, state, zip,
      owner_name, owner_email, contract_value,
      substantial_completion_date, status = 'active'
    } = body

    const [project] = await sql`
      INSERT INTO projects (name, address, city, state, zip, owner_name, owner_email, contract_value, substantial_completion_date, status)
      VALUES (${name}, ${address}, ${city}, ${state}, ${zip}, ${owner_name}, ${owner_email}, ${contract_value}, ${substantial_completion_date || null}, ${status})
      RETURNING *
    `
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
