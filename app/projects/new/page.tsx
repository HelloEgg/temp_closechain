'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Building2, HardHat, Trash2, Plus, Check, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { cn } from '@/lib/utils'

interface SubEntry {
  company_name: string
  contact_name: string
  email: string
  phone: string
  csi_division: string
  csi_code: string
}

const CSI_DIVISIONS = [
  { code: '01 00 00', label: 'Division 01 - General Requirements' },
  { code: '02 00 00', label: 'Division 02 - Existing Conditions' },
  { code: '03 00 00', label: 'Division 03 - Concrete' },
  { code: '04 00 00', label: 'Division 04 - Masonry' },
  { code: '05 00 00', label: 'Division 05 - Metals' },
  { code: '06 00 00', label: 'Division 06 - Wood & Plastics' },
  { code: '07 00 00', label: 'Division 07 - Thermal & Moisture' },
  { code: '08 00 00', label: 'Division 08 - Openings' },
  { code: '09 00 00', label: 'Division 09 - Finishes' },
  { code: '10 00 00', label: 'Division 10 - Specialties' },
  { code: '11 00 00', label: 'Division 11 - Equipment' },
  { code: '12 00 00', label: 'Division 12 - Furnishings' },
  { code: '21 00 00', label: 'Division 21 - Fire Suppression' },
  { code: '22 00 00', label: 'Division 22 - Plumbing' },
  { code: '23 00 00', label: 'Division 23 - HVAC' },
  { code: '26 00 00', label: 'Division 26 - Electrical' },
  { code: '27 00 00', label: 'Division 27 - Communications' },
  { code: '28 00 00', label: 'Division 28 - Electronic Safety' },
]

const DEFAULT_DOCS = ['O&M Manual', 'Warranty Letter', 'As-Built Drawings', 'Final Inspection Report']

const STEPS = ['Project Details', 'Add Subcontractors', 'Review & Create']

const inputClass = 'w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors'
const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 0
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [completionDate, setCompletionDate] = useState('')

  // Step 1
  const [subs, setSubs] = useState<SubEntry[]>([
    { company_name: '', contact_name: '', email: '', phone: '', csi_division: '', csi_code: '' },
  ])
  const [subErrors, setSubErrors] = useState<string[]>([])

  const canGoNext0 = name.trim() && address.trim() && city.trim() && state.trim() && ownerName.trim() && ownerEmail.trim()

  const validateSubs = () => {
    const errs: string[] = []
    for (const sub of subs) {
      if (!sub.company_name.trim() || !sub.csi_code.trim()) {
        errs.push('All subcontractors must have a company name and CSI division.')
        break
      }
    }
    return errs
  }

  const handleNext = () => {
    if (step === 1) {
      const errs = validateSubs()
      if (errs.length > 0) { setSubErrors(errs); return }
      setSubErrors([])
    }
    setStep(s => Math.min(s + 1, 2))
  }

  const addSub = () => setSubs(prev => [...prev, { company_name: '', contact_name: '', email: '', phone: '', csi_division: '', csi_code: '' }])
  const removeSub = (i: number) => setSubs(prev => prev.filter((_, idx) => idx !== i))
  const updateSub = (i: number, field: keyof SubEntry, value: string) => {
    setSubs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, address, city, state, zip,
          owner_name: ownerName,
          owner_email: ownerEmail,
          contract_value: parseFloat(contractValue) || 0,
          substantial_completion_date: completionDate || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      const project = await res.json()

      // Add each subcontractor
      for (const sub of subs) {
        if (!sub.company_name.trim()) continue
        await fetch(`/api/projects/${project.id}/subcontractors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...sub, required_docs: DEFAULT_DOCS }),
        })
      }

      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans">Create New Project</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Set up a new construction closeout package</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors', i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-secondary text-muted-foreground')}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn('text-sm font-medium hidden sm:block', i === step ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-px mx-3', i < step ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-primary/10 rounded-xl"><Building2 className="w-5 h-5 text-primary" /></div>
                <h2 className="text-lg font-semibold text-foreground">Project Details</h2>
              </div>
              <div>
                <label className={labelClass}>Project Name *</label>
                <input className={inputClass} placeholder="e.g. Downtown Office Renovation" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Street Address *</label>
                <input className={inputClass} placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>City *</label>
                  <input className={inputClass} placeholder="Austin" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input className={inputClass} placeholder="TX" maxLength={2} value={state} onChange={e => setState(e.target.value.toUpperCase())} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>ZIP Code</label>
                  <input className={inputClass} placeholder="78701" value={zip} onChange={e => setZip(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Contract Value</label>
                  <input className={inputClass} type="number" placeholder="0.00" value={contractValue} onChange={e => setContractValue(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Owner Name *</label>
                  <input className={inputClass} placeholder="Jane Smith" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Owner Email *</label>
                  <input className={inputClass} type="email" placeholder="owner@example.com" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Substantial Completion Date</label>
                <input className={inputClass} type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl"><HardHat className="w-5 h-5 text-primary" /></div>
                  <h2 className="text-lg font-semibold text-foreground">Add Subcontractors</h2>
                </div>
                <button onClick={addSub} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {subErrors.length > 0 && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{subErrors[0]}</p>
                </div>
              )}
              <div className="flex flex-col gap-4">
                {subs.map((sub, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 flex flex-col gap-3 relative">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">Subcontractor {i + 1}</p>
                      {subs.length > 1 && (
                        <button onClick={() => removeSub(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Company Name *</label>
                        <input className={inputClass} placeholder="ABC Electric" value={sub.company_name} onChange={e => updateSub(i, 'company_name', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Name</label>
                        <input className={inputClass} placeholder="John Doe" value={sub.contact_name} onChange={e => updateSub(i, 'contact_name', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Email</label>
                        <input className={inputClass} type="email" placeholder="contact@example.com" value={sub.email} onChange={e => updateSub(i, 'email', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input className={inputClass} placeholder="512-555-0100" value={sub.phone} onChange={e => updateSub(i, 'phone', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>CSI Division *</label>
                      <select
                        className={inputClass}
                        value={sub.csi_code}
                        onChange={e => {
                          const selected = CSI_DIVISIONS.find(d => d.code === e.target.value)
                          updateSub(i, 'csi_code', e.target.value)
                          updateSub(i, 'csi_division', selected?.label ?? '')
                        }}
                      >
                        <option value="">Select a division...</option>
                        {CSI_DIVISIONS.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-primary/10 rounded-xl"><Check className="w-5 h-5 text-primary" /></div>
                <h2 className="text-lg font-semibold text-foreground">Review & Create</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-secondary/50 rounded-xl p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</p>
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">{address}, {city}, {state} {zip}</p>
                  <p className="text-sm text-muted-foreground">Owner: {ownerName} ({ownerEmail})</p>
                  {contractValue && <p className="text-sm text-muted-foreground">Contract: ${parseFloat(contractValue).toLocaleString()}</p>}
                  {completionDate && <p className="text-sm text-muted-foreground">Completion: {new Date(completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{subs.filter(s => s.company_name.trim()).length} Subcontractor(s)</p>
                  {subs.filter(s => s.company_name.trim()).map((sub, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{sub.company_name}</p>
                        <p className="text-xs text-muted-foreground">{sub.csi_division || sub.csi_code}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Default Documents Per Sub</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_DOCS.map(d => (
                      <span key={d} className="text-xs bg-card border border-border rounded-full px-2.5 py-1 text-foreground">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step === 0 ? router.push('/dashboard') : setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 2 ? (
            <button
              onClick={handleNext}
              disabled={step === 0 && !canGoNext0}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
