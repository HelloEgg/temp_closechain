'use client'

import React, { useState, useMemo, use } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import {
  ChevronLeft, ChevronDown, ChevronRight, FileText, CheckCircle2,
  Clock, AlertCircle, Globe, HardHat, Bot, Send, Copy, Plus, X,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import { cn } from '@/lib/utils'
import type { Project, ProjectSubcontractor, Document, DocStatus } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Tab = 'all' | 'pending' | 'received' | 'approved'
type ViewMode = 'by_sub' | 'by_section'

interface DocWithSub extends Document {
  company_name: string
  csi_division: string
  csi_code: string
  sub_status: string
  sub_progress: number
}

function DocStatusIcon({ status }: { status: DocStatus }) {
  if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  if (status === 'received') return <Clock className="w-4 h-4 text-amber-500" />
  if (status === 'rejected') return <AlertCircle className="w-4 h-4 text-destructive" />
  return <FileText className="w-4 h-4 text-muted-foreground" />
}

function DocStatusBadge({ status }: { status: DocStatus }) {
  const styles: Record<DocStatus, string> = {
    pending: 'bg-secondary text-muted-foreground',
    received: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    waived: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', styles[status])}>
      {status}
    </span>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-secondary rounded-full h-1.5">
      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

function DocumentRow({ doc, projectId }: { doc: DocWithSub; projectId: string }) {
  const [updating, setUpdating] = useState(false)

  const cycleStatus = async () => {
    const next: Record<DocStatus, DocStatus> = {
      pending: 'received',
      received: 'approved',
      approved: 'pending',
      rejected: 'pending',
      waived: 'pending',
    }
    setUpdating(true)
    await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next[doc.status] }),
    })
    await mutate(`/api/projects/${projectId}/documents`)
    await mutate(`/api/projects/${projectId}/subcontractors`)
    setUpdating(false)
  }

  return (
    <tr className="hover:bg-secondary/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <DocStatusIcon status={doc.status} />
          <span className="text-sm font-medium text-foreground">{doc.name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell">
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{doc.category}</span>
      </td>
      <td className="px-5 py-3.5">
        <DocStatusBadge status={doc.status} />
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-muted-foreground">
        {doc.due_date ? new Date(doc.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
      </td>
      <td className="px-5 py-3.5">
        <button
          onClick={cycleStatus}
          disabled={updating}
          className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
        >
          {updating ? 'Saving...' : 'Update'}
        </button>
      </td>
    </tr>
  )
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: project, isLoading: projectLoading } = useSWR<Project>(`/api/projects/${id}`, fetcher)
  const { data: subcontractors } = useSWR<ProjectSubcontractor[]>(`/api/projects/${id}/subcontractors`, fetcher)
  const { data: documents } = useSWR<DocWithSub[]>(`/api/projects/${id}/documents`, fetcher)
  const { data: portal } = useSWR<{ token: string } | null>(`/api/projects/${id}/portal`, fetcher)

  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('by_sub')
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiInput, setAIInput] = useState('')
  const [aiMessages, setAIMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isAILoading, setIsAILoading] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const toggleSub = (id: string) => setExpandedSubs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSection = (s: string) => setExpandedSections(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n })

  const filteredDocs = useMemo(() => {
    const docs = documents || []
    if (activeTab === 'all') return docs
    return docs.filter(d => d.status === activeTab)
  }, [documents, activeTab])

  const docsBySub = useMemo(() => {
    const map: Record<string, { psId: string; companyName: string; csiCode: string; csiDivision: string; docs: DocWithSub[] }> = {}
    for (const doc of filteredDocs) {
      const key = doc.project_subcontractor_id
      if (!map[key]) map[key] = { psId: key, companyName: doc.company_name, csiCode: doc.csi_code, csiDivision: doc.csi_division, docs: [] }
      map[key].docs.push(doc)
    }
    return Object.values(map).sort((a, b) => a.csiCode.localeCompare(b.csiCode))
  }, [filteredDocs])

  const docsBySection = useMemo(() => {
    const map: Record<string, DocWithSub[]> = {}
    for (const doc of filteredDocs) {
      if (!map[doc.category]) map[doc.category] = []
      map[doc.category].push(doc)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredDocs])

  const handleAISend = async () => {
    const q = aiInput.trim()
    if (!q || isAILoading) return
    setAIInput('')
    const userMsg = { role: 'user' as const, content: q }
    setAIMessages(prev => [...prev, userMsg])
    setIsAILoading(true)
    await fetch(`/api/projects/${id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userMsg) })
    await new Promise(r => setTimeout(r, 900))
    const botMsg = { role: 'assistant' as const, content: `Based on the current closeout status for ${project?.name ?? 'this project'}, I can see the document tracking board. ${filteredDocs.filter(d => d.status === 'pending').length} documents are still pending and ${filteredDocs.filter(d => d.status === 'approved').length} are approved. Would you like me to send reminders to subcontractors with outstanding items?` }
    setAIMessages(prev => [...prev, botMsg])
    await fetch(`/api/projects/${id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(botMsg) })
    setIsAILoading(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handlePublish = async () => {
    setPublishing(true)
    await fetch(`/api/projects/${id}/portal`, { method: 'POST' })
    await mutate(`/api/projects/${id}/portal`)
    setPublishing(false)
  }

  const copyPortalLink = () => {
    if (!portal?.token) return
    navigator.clipboard.writeText(`${window.location.origin}/portal/${portal.token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const allDocs = documents || []
  const tabs = [
    { key: 'all' as Tab, label: 'All', count: allDocs.length },
    { key: 'pending' as Tab, label: 'Open', count: allDocs.filter(d => d.status === 'pending').length },
    { key: 'received' as Tab, label: 'Pending Review', count: allDocs.filter(d => d.status === 'received').length },
    { key: 'approved' as Tab, label: 'Approved', count: allDocs.filter(d => d.status === 'approved').length },
  ]

  if (projectLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-8 bg-card rounded-xl w-64" />
          <div className="h-40 bg-card rounded-2xl" />
          <div className="h-96 bg-card rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Project not found.</p>
          <Link href="/dashboard" className="mt-3 inline-block text-primary text-sm hover:underline">Back to Dashboard</Link>
        </div>
      </AppLayout>
    )
  }

  const contractValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(project.contract_value))

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Back + Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors w-fit">
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground font-sans text-pretty">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground">{project.address}, {project.city}, {project.state} {project.zip}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowAIPanel(p => !p)}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border', showAIPanel ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:border-primary/40')}
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Contract Value', value: contractValue },
            { label: 'Owner', value: project.owner_name },
            { label: 'Completion', value: project.substantial_completion_date ? new Date(project.substantial_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD' },
            { label: 'Subcontractors', value: subcontractors?.length ?? '—' },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-base font-semibold text-foreground mt-0.5 truncate">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Overall Closeout Progress</span>
            <span className="font-bold text-primary">{project.progress_percent}%</span>
          </div>
          <ProgressBar value={project.progress_percent} />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span><span className="font-semibold text-foreground">{allDocs.filter(d => d.status === 'approved').length}</span> approved</span>
            <span><span className="font-semibold text-foreground">{allDocs.filter(d => d.status === 'received').length}</span> pending review</span>
            <span><span className="font-semibold text-foreground">{allDocs.filter(d => d.status === 'pending').length}</span> open</span>
          </div>
        </div>

        <div className={cn('flex gap-5', showAIPanel ? 'flex-col lg:flex-row' : '')}>
          {/* Main tracking board */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Tabs + View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex border-b border-border gap-0 overflow-x-auto">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={cn('px-4 py-2.5 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors', activeTab === t.key ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground')}
                  >
                    {t.label}
                    <span className={cn('px-1.5 py-0.5 rounded-full text-xs font-bold', activeTab === t.key ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground')}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex bg-secondary rounded-lg p-0.5 text-sm">
                {(['by_sub', 'by_section'] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={cn('px-3 py-1.5 rounded-md font-medium transition-colors', viewMode === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    {v === 'by_sub' ? 'By Sub' : 'By Section'}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Board */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {filteredDocs.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">No documents match this filter.</div>
              ) : viewMode === 'by_sub' ? (
                <div className="divide-y divide-border">
                  {docsBySub.map(group => (
                    <div key={group.psId}>
                      <button
                        onClick={() => toggleSub(group.psId)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <HardHat className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-foreground text-sm">{group.companyName}</p>
                            <p className="text-xs text-muted-foreground">{group.csiCode} — {group.csiDivision}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{group.docs.length} docs</span>
                          {expandedSubs.has(group.psId) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedSubs.has(group.psId) && (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-secondary/30 border-y border-border">
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Document</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Category</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Due</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {group.docs.map(doc => <DocumentRow key={doc.id} doc={doc} projectId={id} />)}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {docsBySection.map(([section, docs]) => (
                    <div key={section}>
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <p className="font-semibold text-foreground text-sm">{section}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{docs.length} docs</span>
                          {expandedSections.has(section) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expandedSections.has(section) && (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-secondary/30 border-y border-border">
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Document</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Category</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Due</th>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {docs.map(doc => <DocumentRow key={doc.id} doc={doc} projectId={id} />)}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Panel */}
          {showAIPanel && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-card border border-border rounded-2xl flex flex-col h-[560px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">Closechain AI</span>
                </div>
                <button onClick={() => setShowAIPanel(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {aiMessages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-4">Ask me anything about this project&apos;s closeout status.</p>
                )}
                {aiMessages.map((m, i) => (
                  <div key={i} className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm', m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm')}>
                    {m.content}
                  </div>
                ))}
                {isAILoading && (
                  <div className="bg-secondary rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-muted-foreground w-fit">
                    Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about this project..."
                  value={aiInput}
                  onChange={e => setAIInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAISend()}
                  className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
                <button
                  onClick={handleAISend}
                  disabled={!aiInput.trim() || isAILoading}
                  className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Publish Client Portal</h2>
              <button onClick={() => setShowPublishModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {portal?.token ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Your client portal is live. Share this link with your client:</p>
                <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                  <p className="text-xs text-foreground flex-1 truncate font-mono">{window.location.origin}/portal/{portal.token}</p>
                  <button onClick={copyPortalLink} className="flex items-center gap-1 text-primary text-xs font-medium hover:underline flex-shrink-0">
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full py-2.5 bg-secondary border border-border text-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {publishing ? 'Generating...' : 'Regenerate Link'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Generate a secure link to share approved closeout documents with your client.</p>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {publishing ? 'Publishing...' : 'Publish Portal'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
