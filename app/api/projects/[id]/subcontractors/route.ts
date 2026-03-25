import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await sql`
      SELECT
        ps.id, ps.project_id, ps.subcontractor_id, ps.status, ps.progress_percent, ps.created_at,
        s.company_name, s.contact_name, s.email, s.phone, s.csi_division, s.csi_code
      FROM project_subcontractors ps
      JOIN subcontractors s ON s.id = ps.subcontractor_id
      WHERE ps.project_id = ${id}
      ORDER BY s.csi_code
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET project subcontractors error:', error)
    return NextResponse.json({ error: 'Failed to fetch subcontractors' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: project_id } = await params
    const body = await request.json()
    const { company_name, contact_name, email, phone, csi_division, csi_code, required_docs } = body

    // Upsert subcontractor
    const [sub] = await sql`
      INSERT INTO subcontractors (company_name, contact_name, email, phone, csi_division, csi_code)
      VALUES (${company_name}, ${contact_name}, ${email}, ${phone || null}, ${csi_division}, ${csi_code})
      RETURNING *
    `

    // Link to project
    const [ps] = await sql`
      INSERT INTO project_subcontractors (project_id, subcontractor_id)
      VALUES (${project_id}, ${sub.id})
      ON CONFLICT (project_id, subcontractor_id) DO UPDATE SET status = project_subcontractors.status
      RETURNING *
    `

    // Seed required documents if provided
    if (required_docs && Array.isArray(required_docs) && required_docs.length > 0) {
      for (const docName of required_docs) {
        await sql`
          INSERT INTO documents (project_subcontractor_id, name, category, status)
          VALUES (${ps.id}, ${docName}, 'General', 'pending')
        `
      }
    }

    return NextResponse.json({ ...ps, company_name: sub.company_name, contact_name: sub.contact_name, email: sub.email, phone: sub.phone, csi_division: sub.csi_division, csi_code: sub.csi_code }, { status: 201 })
  } catch (error) {
    console.error('POST project subcontractors error:', error)
    return NextResponse.json({ error: 'Failed to add subcontractor' }, { status: 500 })
  }
}
