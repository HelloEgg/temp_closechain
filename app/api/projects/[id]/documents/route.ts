import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await sql`
      SELECT
        d.*,
        s.company_name, s.csi_division, s.csi_code,
        ps.status as sub_status, ps.progress_percent as sub_progress
      FROM documents d
      JOIN project_subcontractors ps ON ps.id = d.project_subcontractor_id
      JOIN subcontractors s ON s.id = ps.subcontractor_id
      WHERE ps.project_id = ${id}
      ORDER BY s.csi_code, d.name
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET project documents error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}
