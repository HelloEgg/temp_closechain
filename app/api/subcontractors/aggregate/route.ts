import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        ps.id, ps.project_id, ps.subcontractor_id, ps.status, ps.progress_percent,
        s.company_name, s.csi_division, s.csi_code,
        p.name as project_name
      FROM project_subcontractors ps
      JOIN subcontractors s ON s.id = ps.subcontractor_id
      JOIN projects p ON p.id = ps.project_id
      ORDER BY s.company_name, p.name
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/subcontractors/aggregate error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
