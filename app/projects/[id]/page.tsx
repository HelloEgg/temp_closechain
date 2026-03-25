"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Download,
  Globe,
  HardHat,
  Bot,
  Send,
  MoreHorizontal,
  Info,
  Copy,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_PROJECTS, MOCK_DOCUMENTS, type DocumentSlot, type DocumentStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "all" | "not_submitted" | "uploaded" | "approved";
type ViewMode = "by_sub" | "by_section";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = parseInt(id, 10);
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("by_sub");
  const [expandedSubs, setExpandedSubs] = useState<Set<number>>(new Set([1, 2, 7, 12]));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInput, setAIInput] = useState("");
  const [aiMessages, setAIMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPortalLinkCopied, setShowPortalLinkCopied] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const projectSubIds = new Set(project?.subcontractors.map((s) => s.id) ?? []);
  const rawDocuments = MOCK_DOCUMENTS.filter((d) => projectSubIds.has(d.subcontractorId));

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All Documents", count: rawDocuments.length },
    {
      key: "not_submitted",
      label: "Open",
      count: rawDocuments.filter((d) => d.status === "not_submitted").length,
    },
    {
      key: "uploaded",
      label: "Pending Review",
      count: rawDocuments.filter((d) => d.status === "uploaded").length,
    },
    {
      key: "approved",
      label: "Approved",
      count: rawDocuments.filter((d) => d.status === "approved").length,
    },
  ];

  const filteredDocs = useMemo(() => {
    if (activeTab === "all") return rawDocuments;
    return rawDocuments.filter((d) => d.status === activeTab);
  }, [rawDocuments, activeTab]);

  const docsBySub = useMemo(() => {
    const map: Record<
      number,
      { subId: number; vendorName: string; csiCode: string; docs: DocumentSlot[] }
    > = {};
    for (const doc of filteredDocs) {
      if (!map[doc.subcontractorId]) {
        map[doc.subcontractorId] = {
          subId: doc.subcontractorId,
          vendorName: doc.vendorName,
          csiCode: doc.csiCode,
          docs: [],
        };
      }
      map[doc.subcontractorId].docs.push(doc);
    }
    return Object.values(map);
  }, [filteredDocs]);

  const docsBySection = useMemo(() => {
    const map: Record<string, DocumentSlot[]> = {};
    for (const doc of filteredDocs) {
      const section = doc.packageSection ?? "Uncategorized";
      if (!map[section]) map[section] = [];
      map[section].push(doc);
    }
    return Object.entries(map).map(([section, docs]) => ({ section, docs }));
  }, [filteredDocs]);

  const toggleSub = (subId: number) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleAISend = async () => {
    const question = aiInput.trim();
    if (!question || isAILoading) return;
    setAIInput("");
    setAIMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsAILoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setAIMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `For ${project?.name ?? "this project"}: Pacific HVAC is missing Controls Sequences and Warranty Certificate. Bay Electrical has 3 open documents — O&M Manual, Test Reports, and Warranty. I recommend sending reminders to both subcontractors this week.`,
      },
    ]);
    setIsAILoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const copyPortalLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/portal/${project?.clientPortalToken ?? "demo-token-abc123"}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowPortalLinkCopied(true);
      setTimeout(() => setShowPortalLinkCopied(false), 2000);
    });
  };

  if (!project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Project not found
            </h2>
            <Link href="/dashboard" className="text-primary hover:underline text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const portalUrl = `/portal/${project.clientPortalToken ?? "demo-token-abc123"}`;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-display font-bold text-foreground">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
            {project.jobNumber && (
              <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded-md">
                #{project.jobNumber}
              </span>
            )}
            {project.clientName && <span>{project.clientName}</span>}
            {project.endDate && (
              <>
                <span className="text-border">•</span>
                <span>
                  Due{" "}
                  {new Date(project.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAIPanel((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all",
              showAIPanel
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:bg-secondary"
            )}
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </button>
          {project.status === "approved" && project.clientPortalToken ? (
            <div className="flex items-center gap-2">
              <Link
                href={portalUrl}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Globe className="w-4 h-4" />
                Client Portal
              </Link>
              <button
                onClick={copyPortalLink}
                title="Copy portal link"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-secondary transition-colors"
              >
                {showPortalLinkCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Globe className="w-4 h-4" />
              Publish to Client
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: AlertCircle,
            label: "Open",
            value: project.totalDocuments - project.uploadedDocuments,
            iconColor: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            icon: Clock,
            label: "Pending Review",
            value: project.uploadedDocuments - project.approvedDocuments,
            iconColor: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            icon: CheckCircle2,
            label: "Approved",
            value: project.approvedDocuments,
            iconColor: "text-emerald-500",
            bg: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <div className="mb-8 bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Closechain AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowAIPanel(false)}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
          <div className="flex flex-col" style={{ height: "280px" }}>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
              {aiMessages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ask me anything about this project — missing documents, subcontractor status,
                    or next steps.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["What's missing?", "Which subs haven't submitted?", "Ready for client?"].map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => setAIInput(s)}
                          className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
                        >
                          {s}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAILoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-xl px-4 py-2.5 rounded-bl-sm">
                    <span className="inline-flex gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAIInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAISend()}
                placeholder="Ask about this project..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
              <button
                onClick={handleAISend}
                disabled={!aiInput.trim() || isAILoading}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex border-b border-border flex-wrap gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-3 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-px">
          <button
            onClick={() => setViewMode("by_sub")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              viewMode === "by_sub"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            <HardHat className="w-3.5 h-3.5" />
            By Sub
          </button>
          <button
            onClick={() => setViewMode("by_section")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              viewMode === "by_section"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            By Section
          </button>
        </div>
      </div>

      {/* Document Lists */}
      {viewMode === "by_sub" && (
        <div className="space-y-4">
          {docsBySub.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-14 text-center text-muted-foreground text-sm">
              No documents match this filter.
            </div>
          )}
          {docsBySub.map((group) => (
            <SubcontractorDocGroup
              key={group.subId}
              group={group}
              isExpanded={expandedSubs.has(group.subId)}
              onToggle={() => toggleSub(group.subId)}
            />
          ))}
        </div>
      )}

      {viewMode === "by_section" && (
        <div className="space-y-4">
          {docsBySection.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-14 text-center text-muted-foreground text-sm">
              No documents match this filter.
            </div>
          )}
          {docsBySection.map(({ section, docs }) => (
            <SectionDocGroup
              key={section}
              section={section}
              docs={docs}
              isExpanded={expandedSections.has(section)}
              onToggle={() => toggleSection(section)}
            />
          ))}
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPublishModal(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">
                Publish to Client Portal
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              This will create a shareable client portal link for{" "}
              <strong className="text-foreground">{project.name}</strong>. Your client can view
              all approved documents from this secure link.
            </p>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 mb-6">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                {project.approvedDocuments} of {project.totalDocuments} documents are approved.
                You can still publish — pending documents will show as &quot;Pending Review&quot;
                in the portal.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/portal/demo-token-abc123"
                onClick={() => setShowPublishModal(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Publish
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function DocStatusIcon({ status }: { status: DocumentStatus }) {
  if (status === "approved")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  if (status === "uploaded")
    return <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  return <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />;
}

function DocumentRow({ doc }: { doc: DocumentSlot }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/20 transition-colors group">
      <DocStatusIcon status={doc.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {doc.documentType}
          {doc.parentDocumentType && (
            <span className="text-xs text-muted-foreground ml-1.5">
              ({doc.parentDocumentType})
            </span>
          )}
        </p>
        {doc.packageSection && (
          <p className="text-xs text-muted-foreground mt-0.5">{doc.packageSection}</p>
        )}
      </div>

      {doc.fileName && (
        <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[180px]">
          {doc.fileName}
        </span>
      )}

      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {doc.status === "not_submitted" && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Upload className="w-3 h-3" />
            Upload
          </button>
        )}
        {doc.status === "uploaded" && (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {doc.status === "approved" && (
          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function SubcontractorDocGroup({
  group,
  isExpanded,
  onToggle,
}: {
  group: { subId: number; vendorName: string; csiCode: string; docs: DocumentSlot[] };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const approved = group.docs.filter((d) => d.status === "approved").length;
  const uploaded = group.docs.filter((d) => d.status === "uploaded").length;
  const notSubmitted = group.docs.filter((d) => d.status === "not_submitted").length;
  const progress =
    group.docs.length > 0 ? Math.round((approved / group.docs.length) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="p-2 bg-primary/10 rounded-xl">
          <HardHat className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{group.vendorName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">CSI {group.csiCode}</p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {notSubmitted > 0 && (
            <span className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
              <AlertCircle className="w-3.5 h-3.5" />
              {notSubmitted} open
            </span>
          )}
          {uploaded > 0 && (
            <span className="flex items-center gap-1 text-amber-600 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5" />
              {uploaded} pending
            </span>
          )}
          {approved > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approved} approved
            </span>
          )}
          <div className="flex items-center gap-2 hidden sm:flex">
            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold">{progress}%</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-border divide-y divide-border/50">
          {group.docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionDocGroup({
  section,
  docs,
  isExpanded,
  onToggle,
}: {
  section: string;
  docs: DocumentSlot[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const approved = docs.filter((d) => d.status === "approved").length;
  const uploaded = docs.filter((d) => d.status === "uploaded").length;
  const notSubmitted = docs.filter((d) => d.status === "not_submitted").length;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="p-2 bg-secondary rounded-xl">
          <FileText className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-foreground text-sm">{section}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{docs.length} documents</p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {notSubmitted > 0 && (
            <span className="flex items-center gap-1 text-gray-500">
              <AlertCircle className="w-3.5 h-3.5" />
              {notSubmitted} open
            </span>
          )}
          {uploaded > 0 && (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
              {uploaded} pending
            </span>
          )}
          {approved > 0 && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {approved} approved
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-border divide-y divide-border/50">
          {docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
