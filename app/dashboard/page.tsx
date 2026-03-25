'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Building2, Plus, FolderKanban, HardHat, Search, ArrowRight } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Project, ProjectSubcontractor } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-secondary rounded-full h-1.5">
      <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const completionDate = project.substantial_completion_date
    ? new Date(project.substantial_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBD'
  const contractValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(project.contract_value))

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 relative overflow-hidden h-full">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
        <div className="flex items-start justify-between gap-3 pr-6">
          <div>
            <h3 className="font-semibold text-foreground text-base leading-tight text-pretty">{project.name}</h3>
            <p className="text-muted-foreground text-sm mt-0.5">{project.city}, {project.state}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Closeout Progress</span>
            <span className="font-bold text-foreground">{project.progress_percent}%</span>
          </div>
          <ProgressBar value={project.progress_percent} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Contract Value</p>
            <p className="text-sm font-semibold text-foreground">{contractValue}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completion</p>
            <p className="text-sm font-semibold text-foreground">{completionDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Owner</p>
            <p className="text-sm font-semibold text-foreground truncate">{project.owner_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-semibold text-foreground capitalize">{project.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

interface AggregatedSub {
  company_name: string
  csi_division: string
  csi_code: string
  projects: { id: string; name: string }[]
  total_ps: number
  approved_ps: number
}

function SubcontractorAggregateView({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState('')

  const { data: allSubs } = useSWR<(ProjectSubcontractor & { project_name: string; project_id: string })[]>(
    projects.length > 0 ? `/api/subcontractors/aggregate` : null,
    fetcher
  )

  const aggregated = useMemo<AggregatedSub[]>(() => {
    if (!allSubs) return []
    const map: Record<string, AggregatedSub> = {}
    for (const sub of allSubs) {
      const key = sub.company_name.toLowerCase()
      if (!map[key]) {
        map[key] = { company_name: sub.company_name, csi_division: sub.csi_division ?? '', csi_code: sub.csi_code ?? '', projects: [], total_ps: 0, approved_ps: 0 }
      }
      map[key].projects.push({ id: sub.project_id, name: sub.project_name })
      map[key].total_ps += 1
      if (sub.status === 'approved') map[key].approved_ps += 1
    }
    return Object.values(map).sort((a, b) => a.company_name.localeCompare(b.company_name))
  }, [allSubs])

  const filtered = aggregated.filter(s =>
    s.company_name.toLowerCase().includes(search.toLowerCase()) ||
    s.csi_code.includes(search) ||
    s.csi_division.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search subcontractors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">CSI Division</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Projects</th>
              <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((sub, i) => {
              const progress = sub.total_ps > 0 ? Math.round((sub.approved_ps / sub.total_ps) * 100) : 0
              return (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HardHat className="w-4 h-4 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">{sub.company_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground">{sub.csi_code}</span>
                    <p className="text-xs text-muted-foreground mt-1">{sub.csi_division}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {sub.projects.map((p, pi) => (
                        <Link key={pi} href={`/projects/${p.id}`} className="text-xs text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors">
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{progress}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-14 text-center text-muted-foreground text-sm">
                  {allSubs ? 'No subcontractors found.' : 'Loading...'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'projects' | 'subcontractors'>('projects')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all')

  const { data: projects, isLoading, error } = useSWR<Project[]>('/api/projects', fetcher)

  const filtered = (projects || []).filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: projects?.length ?? 0,
    active: projects?.filter(p => p.status === 'active').length ?? 0,
    completed: projects?.filter(p => p.status === 'completed').length ?? 0,
    avgProgress: projects?.length
      ? Math.round(projects.reduce((sum, p) => sum + p.progress_percent, 0) / projects.length)
      : 0,
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Projects Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Overview of all your construction closeout packages</p>
          </div>
          <button
            onClick={() => router.push('/projects/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: stats.total, icon: FolderKanban },
            { label: 'Active', value: stats.active, icon: Building2 },
            { label: 'Completed', value: stats.completed, icon: FolderKanban },
            { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: FolderKanban },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{isLoading ? '—' : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border gap-1">
          {(['projects', 'subcontractors'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'projects' ? <FolderKanban className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
              {tab === 'projects' ? 'Project View' : 'Subcontractor View'}
            </button>
          ))}
        </div>

        {activeTab === 'projects' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'active', 'completed', 'on_hold'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                      statusFilter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <div key={i} className="bg-card border border-border rounded-2xl h-56 animate-pulse" />)}
              </div>
            ) : error ? (
              <div className="text-center py-16 text-destructive text-sm">Failed to load projects. Please refresh.</div>
            ) : filtered.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-14 text-center">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground text-sm mb-5">Get started by creating your first project.</p>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            )}
          </>
        )}

        {activeTab === 'subcontractors' && <SubcontractorAggregateView projects={projects || []} />}
      </div>
    </AppLayout>
  )
}
