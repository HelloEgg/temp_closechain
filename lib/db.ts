import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL!)

// ---- Types ----

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived'
export type SubStatus = 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected'
export type DocStatus = 'pending' | 'received' | 'approved' | 'rejected' | 'waived'

export interface Project {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  owner_name: string
  owner_email: string
  contract_value: number
  substantial_completion_date: string | null
  status: ProjectStatus
  progress_percent: number
  created_at: string
  updated_at: string
}

export interface Subcontractor {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  csi_division: string
  csi_code: string
  created_at: string
}

export interface ProjectSubcontractor {
  id: string
  project_id: string
  subcontractor_id: string
  status: SubStatus
  progress_percent: number
  created_at: string
  // joined fields
  company_name?: string
  contact_name?: string
  email?: string
  phone?: string | null
  csi_division?: string
  csi_code?: string
}

export interface Document {
  id: string
  project_subcontractor_id: string
  name: string
  category: string
  status: DocStatus
  due_date: string | null
  received_date: string | null
  approved_date: string | null
  notes: string | null
  file_url: string | null
  created_at: string
  updated_at: string
}

export interface AiMessage {
  id: string
  project_id: string | null
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ClientPortal {
  id: string
  project_id: string
  token: string
  is_active: boolean
  published_at: string
  created_at: string
}
