"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(220_50%_20%_/_0.08)_0%,_transparent_60%)]" />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="flex items-center mb-6">
            <Image
              src="/images/logo-full.jpg"
              alt="Closechain AI"
              width={320}
              height={128}
              className="h-80 w-auto -ml-6 object-contain"
              priority
            />
          </div>

          {/* Headline */}
          <h2 className="mt-4 text-3xl font-display font-bold tracking-tight text-foreground">
            Stop Searching. Just Ask.
          </h2>
          <p className="mt-2 font-display font-bold tracking-tight text-foreground text-[25px]">
            Chat With Your Space
          </p>

          {/* CTA */}
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="w-full flex justify-between items-center px-6 py-4 border border-transparent text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5"
            >
              Continue with Replit
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  For General Contractors
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right-side hero image hint */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background z-10" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a5f' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </div>
  );
}
