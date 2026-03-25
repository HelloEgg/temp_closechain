import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    const [portal] = await sql`
      SELECT cp.*, p.*,
        cp.id as portal_id, p.id as project_id
      FROM client_portals cp
      JOIN projects p ON p.id = cp.project_id
      WHERE cp.token = ${token} AND cp.is_active = true
    `
    if (!portal) return NextResponse.json({ error: 'Portal not found or inactive' }, { status: 404 })

    // Get approved documents for this project
    const documents = await sql`
      SELECT d.*, s.company_name, s.csi_division, s.csi_code
      FROM documents d
      JOIN project_subcontractors ps ON ps.id = d.project_subcontractor_id
      JOIN subcontractors s ON s.id = ps.subcontractor_id
      WHERE ps.project_id = ${portal.project_id}
        AND d.status = 'approved'
      ORDER BY s.csi_code, d.name
    `

    return NextResponse.json({ portal, documents })
  } catch (error) {
    console.error('GET /api/portal/[token] error:', error)
    return NextResponse.json({ error: 'Failed to load portal' }, { status: 500 })
  }
}
