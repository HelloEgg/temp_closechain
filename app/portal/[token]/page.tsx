"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileText,
  Download,
  Globe,
  HardHat,
  Bot,
  Send,
  Shield,
  Building2,
} from "lucide-react";
import { CLIENT_PORTAL_DATA, type DocumentStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const data = CLIENT_PORTAL_DATA;

  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [aiInput, setAIInput] = useState("");
  const [aiMessages, setAIMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(
    []
  );
  const [isAILoading, setIsAILoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const toggleSub = (name: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAISend = async () => {
    const question = aiInput.trim();
    if (!question || isAILoading) return;
    setAIInput("");
    setAIMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsAILoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setAIMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "All documents for this project have been submitted and approved. The closeout package includes O&M Manuals, As-Built Drawings, Warranty Certificates, and more from MedTech HVAC, Precision Electric, and ClearFlow Plumbing. You can download any document using the Download button on each item.",
      },
    ]);
    setIsAILoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo-icon.jpg"
              alt="Closechain AI"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                {data.projectName}
              </h1>
              <p className="text-sm text-muted-foreground">{data.clientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              Client Portal
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground rounded-full text-xs font-medium">
              <Shield className="w-3 h-3" />
              Secure
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Project Overview */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl flex-shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">{data.projectName}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{data.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">{data.address}</span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Closeout Complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-center sm:text-right">
              <p className="text-5xl font-display font-black text-emerald-600">{data.progress}%</p>
              <p className="text-sm text-muted-foreground mt-1">Documents Approved</p>
              <p className="text-xs text-muted-foreground">
                {data.approvedDocuments} / {data.totalDocuments} documents
              </p>
            </div>
          </div>
          <div className="mt-6 h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">Closechain AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                Ask me anything about this closeout package
              </p>
            </div>
          </div>
          <div className="flex flex-col" style={{ height: "280px" }}>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    {"I have access to all documents in this closeout package. What would you like to know?"}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "What warranties are included?",
                      "Where are the O&M Manuals?",
                      "Show HVAC documents",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setAIInput(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors bg-background"
                      >
                        {s}
                      </button>
                    ))}
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
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
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
                  <div className="bg-secondary rounded-2xl px-4 py-3 rounded-bl-sm">
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
                placeholder="Ask about warranties, manuals, drawings..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
              <button
                onClick={handleAISend}
                disabled={!aiInput.trim() || isAILoading}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents by Subcontractor */}
        <div>
          <h2 className="text-xl font-display font-bold text-foreground mb-4">
            Closeout Documents
          </h2>
          <div className="space-y-4">
            {data.subcontractors.map((sub) => (
              <PortalSubGroup
                key={sub.vendorName}
                sub={sub}
                isExpanded={expandedSubs.has(sub.vendorName)}
                onToggle={() => toggleSub(sub.vendorName)}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/images/logo-icon.jpg"
              alt="Closechain AI"
              width={24}
              height={24}
              className="h-6 w-auto opacity-40"
            />
            <span className="text-sm text-muted-foreground font-medium">
              Powered by Closechain AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This is a secure client portal. Documents are provided for review and record-keeping
            purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PortalSubGroup({
  sub,
  isExpanded,
  onToggle,
}: {
  sub: (typeof CLIENT_PORTAL_DATA.subcontractors)[0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const approved = sub.documents.filter((d) => d.status === "approved").length;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-secondary/20 transition-colors"
      >
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <HardHat className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-foreground text-base">{sub.vendorName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            CSI {sub.csiCode} — {sub.csiDivision}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-foreground">{approved}</span>
            <span className="text-muted-foreground">/ {sub.documents.length} approved</span>
          </div>
          <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${sub.progress}%` }}
            />
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-border divide-y divide-border/50">
          {sub.documents.map((doc, i) => (
            <PortalDocRow key={i} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

function PortalDocRow({
  doc,
}: {
  doc: { documentType: string; status: DocumentStatus; fileName?: string; filePath?: string; parentDocumentType?: string };
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/10 transition-colors group">
      <div className="p-2 bg-secondary rounded-lg">
        <FileText className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {doc.documentType}
          {doc.parentDocumentType && (
            <span className="text-xs text-muted-foreground ml-1.5">
              ({doc.parentDocumentType})
            </span>
          )}
        </p>
        {doc.fileName && (
          <p className="text-xs text-muted-foreground mt-0.5">{doc.fileName}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100">
          <Download className="w-3 h-3" />
          Download
        </button>
      </div>
    </div>
  );
}
