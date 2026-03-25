"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  HardHat,
  Trash2,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CSI_DIVISIONS, type CsiDivision } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SubcontractorEntry {
  vendorName: string;
  vendorCode: string;
  csiCode: string;
  csiDivision: string;
}

const STEPS = ["Project Details", "Add Subcontractors", "Review & Create"];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 0
  const [name, setName] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [endDate, setEndDate] = useState("");

  // Step 1
  const [subcontractors, setSubcontractors] = useState<SubcontractorEntry[]>([
    { vendorName: "", vendorCode: "", csiCode: "", csiDivision: "" },
  ]);
  const [subErrors, setSubErrors] = useState<string[]>([]);

  const canGoNextStep1 = name.trim().length > 0;

  const validateSubs = (): string[] => {
    const errors: string[] = [];
    for (const sub of subcontractors) {
      if (!sub.vendorName.trim() || !sub.csiCode.trim()) {
        errors.push("All subcontractors must have a vendor name and CSI division.");
        break;
      }
    }
    return errors;
  };

  const handleNext = () => {
    if (step === 0 && !canGoNextStep1) return;
    if (step === 1) {
      const errs = validateSubs();
      if (errs.length > 0) {
        setSubErrors(errs);
        return;
      }
      setSubErrors([]);
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const addSub = () =>
    setSubcontractors((prev) => [
      ...prev,
      { vendorName: "", vendorCode: "", csiCode: "", csiDivision: "" },
    ]);

  const removeSub = (i: number) =>
    setSubcontractors((prev) => prev.filter((_, idx) => idx !== i));

  const updateSub = (i: number, field: keyof SubcontractorEntry, value: string) => {
    setSubcontractors((prev) =>
      prev.map((s, idx) => {
        if (idx !== i) return s;
        if (field === "csiCode") {
          const division = CSI_DIVISIONS.find((d) => d.code === value);
          return { ...s, csiCode: value, csiDivision: division?.name ?? "" };
        }
        return { ...s, [field]: value };
      })
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/dashboard");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Create New Project</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Set up your closeout package by defining the project and its subcontractors.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="flex items-center gap-3 group disabled:cursor-default"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold hidden sm:block",
                    i === step
                      ? "text-foreground"
                      : i < step
                      ? "text-emerald-600 cursor-pointer"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 rounded-full transition-all",
                    i < step ? "bg-emerald-300" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 0: Project Details */}
        {step === 0 && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-7">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">Project Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Downtown Office Renovation"
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Job Number
                </label>
                <input
                  type="text"
                  value={jobNumber}
                  onChange={(e) => setJobNumber(e.target.value)}
                  placeholder="e.g. JOB-2026-001"
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Project Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, San Francisco, CA"
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background shadow-sm text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief project scope description..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background shadow-sm resize-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Subcontractors */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <HardHat className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Subcontractors
                </h2>
              </div>
              <button
                onClick={addSub}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another
              </button>
            </div>
            {subErrors.length > 0 && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {subErrors[0]}
              </div>
            )}
            <div className="space-y-5">
              {subcontractors.map((sub, i) => (
                <SubcontractorRow
                  key={i}
                  index={i}
                  sub={sub}
                  onUpdate={updateSub}
                  onRemove={() => removeSub(i)}
                  canRemove={subcontractors.length > 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Project Details
                </h2>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Project Name
                  </dt>
                  <dd className="font-semibold text-foreground mt-1">{name}</dd>
                </div>
                {jobNumber && (
                  <div>
                    <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Job Number
                    </dt>
                    <dd className="font-semibold text-foreground mt-1">{jobNumber}</dd>
                  </div>
                )}
                {clientName && (
                  <div>
                    <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Client
                    </dt>
                    <dd className="font-semibold text-foreground mt-1">{clientName}</dd>
                  </div>
                )}
                {endDate && (
                  <div>
                    <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      End Date
                    </dt>
                    <dd className="font-semibold text-foreground mt-1">{endDate}</dd>
                  </div>
                )}
                {address && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Address
                    </dt>
                    <dd className="font-semibold text-foreground mt-1">{address}</dd>
                  </div>
                )}
                {description && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                      Description
                    </dt>
                    <dd className="font-semibold text-foreground mt-1">{description}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <HardHat className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Subcontractors ({subcontractors.length})
                </h2>
              </div>
              <div className="space-y-3">
                {subcontractors.map((sub, i) => {
                  const div = CSI_DIVISIONS.find((d) => d.code === sub.csiCode);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <HardHat className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{sub.vendorName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            CSI {sub.csiCode} — {sub.csiDivision}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {div?.requiredDocuments.length ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">docs required</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-5 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Total documents to collect:</span>
                <span className="font-bold text-foreground">
                  {subcontractors.reduce((sum, sub) => {
                    const div = CSI_DIVISIONS.find((d) => d.code === sub.csiCode);
                    return sum + (div?.requiredDocuments.length ?? 0);
                  }, 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-xl font-semibold text-sm hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 2 ? (
            <button
              onClick={handleNext}
              disabled={step === 0 && !canGoNextStep1}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-flex gap-0.5">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1 h-1 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                  Creating...
                </>
              ) : (
                <>
                  Create Project
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function SubcontractorRow({
  index,
  sub,
  onUpdate,
  onRemove,
  canRemove,
}: {
  index: number;
  sub: SubcontractorEntry;
  onUpdate: (i: number, field: keyof SubcontractorEntry, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Subcontractor #{index + 1}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            aria-label="Remove subcontractor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Vendor Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={sub.vendorName}
            onChange={(e) => onUpdate(index, "vendorName", e.target.value)}
            placeholder="e.g. Pacific HVAC Inc."
            className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            Vendor Code
          </label>
          <input
            type="text"
            value={sub.vendorCode}
            onChange={(e) => onUpdate(index, "vendorCode", e.target.value)}
            placeholder="e.g. PAHVAC"
            className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
            CSI Division <span className="text-destructive">*</span>
          </label>
          <select
            value={sub.csiCode}
            onChange={(e) => onUpdate(index, "csiCode", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
          >
            <option value="">Select division...</option>
            {CSI_DIVISIONS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {sub.csiCode && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Required documents: </span>
            {CSI_DIVISIONS.find((d) => d.code === sub.csiCode)
              ?.requiredDocuments.map((d) => d.documentType)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
