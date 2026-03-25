import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [project] = await sql`SELECT * FROM projects WHERE id = ${id}`
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name, address, city, state, zip,
      owner_name, owner_email, contract_value,
      substantial_completion_date, status, progress_percent
    } = body

    const [project] = await sql`
      UPDATE projects SET
        name = COALESCE(${name}, name),
        address = COALESCE(${address}, address),
        city = COALESCE(${city}, city),
        state = COALESCE(${state}, state),
        zip = COALESCE(${zip}, zip),
        owner_name = COALESCE(${owner_name}, owner_name),
        owner_email = COALESCE(${owner_email}, owner_email),
        contract_value = COALESCE(${contract_value}, contract_value),
        substantial_completion_date = COALESCE(${substantial_completion_date ?? null}, substantial_completion_date),
        status = COALESCE(${status}, status),
        progress_percent = COALESCE(${progress_percent ?? null}, progress_percent),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await sql`DELETE FROM projects WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
