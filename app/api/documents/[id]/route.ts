import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, received_date, approved_date } = body

    const [doc] = await sql`
      UPDATE documents SET
        status = COALESCE(${status}, status),
        notes = COALESCE(${notes ?? null}, notes),
        received_date = COALESCE(${received_date ?? null}, received_date),
        approved_date = COALESCE(${approved_date ?? null}, approved_date),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Recalculate parent project_subcontractor progress
    await sql`
      UPDATE project_subcontractors
      SET progress_percent = (
        SELECT ROUND(
          COUNT(*) FILTER (WHERE status IN ('approved','received')) * 100.0 / NULLIF(COUNT(*), 0)
        )
        FROM documents
        WHERE project_subcontractor_id = ${doc.project_subcontractor_id}
      )
      WHERE id = ${doc.project_subcontractor_id}
    `

    return NextResponse.json(doc)
  } catch (error) {
    console.error('PATCH /api/documents/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}
