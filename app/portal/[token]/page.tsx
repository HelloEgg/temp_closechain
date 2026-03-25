'use client'

import React, { useState, use } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import {
  ChevronDown, ChevronRight, CheckCircle2, FileText,
  Globe, HardHat, Bot, Send, Shield, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Document, Project } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface PortalData {
  portal: { token: string; published_at: string; is_active: boolean } & { project_id: string }
  documents: (Document & { company_name: string; csi_division: string; csi_code: string })[]
}

export default function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data, isLoading, error } = useSWR<PortalData>(`/api/portal/${token}`, fetcher)

  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())
  const [aiInput, setAIInput] = useState('')
  const [aiMessages, setAIMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isAILoading, setIsAILoading] = useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const toggleSub = (name: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const handleAISend = async () => {
    const question = aiInput.trim()
    if (!question || isAILoading) return
    setAIInput('')
    setAIMessages(prev => [...prev, { role: 'user', content: question }])
    setIsAILoading(true)
    await new Promise(r => setTimeout(r, 900))
    const docCount = data?.documents.length ?? 0
    setAIMessages(prev => [...prev, {
      role: 'assistant',
      content: `This closeout package contains ${docCount} approved document${docCount !== 1 ? 's' : ''}. All items have been reviewed and approved by the general contractor. You can expand each subcontractor section to view and download individual documents. Is there a specific document or trade you need help finding?`,
    }])
    setIsAILoading(false)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // Group documents by subcontractor
  const docsBySub = React.useMemo(() => {
    if (!data?.documents) return []
    const map: Record<string, { companyName: string; csiDivision: string; csiCode: string; docs: typeof data.documents }> = {}
    for (const doc of data.documents) {
      const key = doc.company_name
      if (!map[key]) map[key] = { companyName: doc.company_name, csiDivision: doc.csi_division, csiCode: doc.csi_code, docs: [] }
      map[key].docs.push(doc)
    }
    return Object.values(map).sort((a, b) => a.csiCode.localeCompare(b.csiCode))
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading portal...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Portal Not Found</h2>
          <p className="text-muted-foreground text-sm">This link may have expired or is no longer active. Please contact your general contractor for a new link.</p>
        </div>
      </div>
    )
  }

  const project = data.portal as unknown as Project
  const publishedDate = new Date(data.portal.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/images/logo-icon.jpg" alt="Closechain AI" width={40} height={40} className="h-10 w-auto" />
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">{(project as any).name ?? 'Closeout Package'}</h1>
              <p className="text-xs text-muted-foreground">Owner: {(project as any).owner_name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified & Published
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6">
        {/* Main */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Hero */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl flex-shrink-0">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Closeout Package Ready</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This package contains <span className="font-semibold text-foreground">{data.documents.length} approved document{data.documents.length !== 1 ? 's' : ''}</span> from <span className="font-semibold text-foreground">{docsBySub.length} subcontractor{docsBySub.length !== 1 ? 's' : ''}</span>. Published on {publishedDate}.
                </p>
              </div>
            </div>
          </div>

          {/* Document list by subcontractor */}
          <div className="flex flex-col gap-0 bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            <div className="px-5 py-3.5 bg-secondary/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved Documents by Subcontractor</p>
            </div>
            {docsBySub.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">No approved documents in this package yet.</div>
            ) : (
              docsBySub.map(group => (
                <div key={group.companyName}>
                  <button
                    onClick={() => toggleSub(group.companyName)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HardHat className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-sm">{group.companyName}</p>
                        <p className="text-xs text-muted-foreground">{group.csiCode} — {group.csiDivision}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">{group.docs.length} approved</span>
                      {expandedSubs.has(group.companyName) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedSubs.has(group.companyName) && (
                    <div className="border-t border-border/60 divide-y divide-border/60">
                      {group.docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/10 transition-colors pl-16">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.category}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full">Approved</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Trust footer */}
          <div className="flex items-center gap-3 bg-secondary/40 border border-border rounded-xl px-4 py-3">
            <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">This portal is read-only and secured by Closechain AI. All documents have been reviewed and approved by the general contractor.</p>
          </div>
        </div>

        {/* AI Panel */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-card border border-border rounded-2xl flex flex-col h-[480px] lg:h-[600px] sticky top-24">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Closechain AI</p>
              <p className="text-xs text-muted-foreground">Ask about this package</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-foreground max-w-[90%]">
              Hi! I can answer questions about this closeout package. What would you like to know?
            </div>
            {aiMessages.map((m, i) => (
              <div key={i} className={cn('max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm', m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-foreground rounded-bl-sm')}>
                {m.content}
              </div>
            ))}
            {isAILoading && (
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-muted-foreground w-fit">Thinking...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
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
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-icon.jpg" alt="Closechain AI" width={20} height={20} className="h-5 w-auto opacity-60" />
            <span>Powered by Closechain AI</span>
          </div>
          <span>Published {publishedDate}</span>
        </div>
      </footer>
    </div>
  )
}
