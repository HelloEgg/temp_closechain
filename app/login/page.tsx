"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:flex-none lg:w-[520px] lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10 flex items-center">
            <Image
              src="/images/logo-full.jpg"
              alt="Closechain AI"
              width={300}
              height={120}
              className="h-20 w-auto object-contain"
              priority
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground text-balance">
            Stop Searching.
            <br />
            Just Ask.
          </h1>
          <p className="mt-3 text-lg text-muted-foreground font-display">
            Chat with your closeout package.
          </p>

          {/* CTA */}
          <div className="mt-10 space-y-4">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-semibold text-primary-foreground bg-primary shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              Continue with Replit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground font-medium uppercase tracking-wide">
                For General Contractors
              </span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { value: "100%", label: "Secure" },
              { value: "AI", label: "Powered" },
              { value: "24/7", label: "Access" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-display font-black text-primary">{stat.value}</span>
                <span className="text-xs text-muted-foreground mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: "hsl(220 50% 20%)" }}>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Floating cards */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 max-w-xs ml-auto">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
              Downtown Office Renovation
            </p>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-display font-black text-white">43%</span>
              <span className="text-white/60 text-xs">28 / 42 docs</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "43%" }} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 max-w-xs">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
              AI Assistant
            </p>
            <p className="text-white text-sm leading-relaxed">
              Pacific HVAC is missing Controls Sequences and Warranty Certificate. I recommend
              sending a reminder this week.
            </p>
          </div>

          <div
            className="backdrop-blur-sm border rounded-2xl p-5 max-w-xs ml-auto"
            style={{ background: "rgba(16,185,129,0.2)", borderColor: "rgba(52,211,153,0.3)" }}
          >
            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wide mb-2">
              Westside Medical Center
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-display font-black text-white">100%</span>
              <span className="text-emerald-300 text-xs font-semibold bg-emerald-400/20 px-2 py-0.5 rounded-full">
                Published
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
