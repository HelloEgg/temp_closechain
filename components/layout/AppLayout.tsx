"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LogOut,
  Menu,
  X,
  Bot,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ManagerAIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const suggestions = [
    "What's missing from my projects?",
    "Which subs haven't submitted?",
    "Show overall progress",
  ];

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Based on your projects: Downtown Office Renovation is at 43% — Pacific HVAC is missing Controls Sequences and Warranty. Harbor View Condominiums is at 21% — FlowRite Plumbing has only submitted 1 of 7 required documents. Westside Medical Center is 100% complete and published.",
      },
    ]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span>Closechain Agent</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col" style={{ height: "320px" }}>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <Bot className="w-8 h-8 text-primary/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ask me about your projects, subcontractors, or document status.
                </p>
                <div className="mt-3 space-y-1.5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        textareaRef.current?.focus();
                      }}
                      className="block w-full text-left text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl px-3 py-2 rounded-bl-sm">
                  <span className="inline-flex gap-0.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t border-border">
            <div className="flex gap-1.5 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your projects..."
                rows={2}
                disabled={isLoading}
                className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [{ href: "/dashboard", label: "Dashboard", icon: FolderKanban }];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <Image
          src="/images/logo-icon.jpg"
          alt="Closechain AI"
          width={44}
          height={44}
          className="h-11 w-auto"
        />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-3 py-3 hidden md:flex items-center border-b border-border/50">
          <Image
            src="/images/logo-sidebar.jpg"
            alt="Closechain AI"
            width={210}
            height={100}
            className="h-24 w-auto -ml-2 object-contain"
            priority
          />
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* AI Panel */}
        <ManagerAIPanel />

        {/* User Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-1 py-1 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">JS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">John Smith</p>
              <p className="text-xs text-muted-foreground truncate">john@smithgc.com</p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto" style={{ background: "hsl(210 20% 97%)" }}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
