"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  
  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin" || user.email?.toLowerCase() === "admin@hitsapp.com") {
      return "/admin/dashboard";
    }
    if (user.role === "senior") {
      return "/senior/dashboard";
    }
    if (user.role === "specialist") {
      return "/specialist/dashboard";
    }
    return "/login";
  };

  return (
    <header className="z-40 bg-white">
      <div className="max-w-7xl mx-auto px-14 md:px-18">
        <div className="flex items-center justify-between py-8 md:py-10">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border-4 border-primary-500 flex items-center justify-center bg-white shadow-soft">
              <span className="text-primary-600 font-extrabold text-xl">H</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary-600 tracking-tight">HITSapp</p>
              <p className="text-sm text-text-secondary">Hire IT Specialists</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-[18px] font-semibold text-primary-900">
            <Link href="/about" className="hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/consumer-services" className="hover:text-primary-600 transition-colors">
              Consumers
            </Link>
            <Link href="/enterprise-services" className="hover:text-primary-600 transition-colors">
              Enterprises
            </Link>
            <Link href="/howto-offerings" className="hover:text-primary-600 transition-colors">
              Resources
            </Link>
            <Link href="/plans" className="hover:text-primary-600 transition-colors">
              Plans
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-5">
            <a href="https://candoo.screenconnect.com" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="secondary"
                className="px-7 h-13 text-[16px] bg-accent-400 text-white hover:bg-accent-500"
              >
                Member Support
              </Button>
            </a>
            {user ? (
              <Link href={getDashboardLink()} className="text-[18px] font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-[18px] font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-md border border-secondary-300 text-text-primary"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white">
          <div className="max-w-7xl mx-auto px-12 md:px-16 py-6">
            <nav className="grid gap-3 text-[18px] font-semibold text-primary-900">
              <Link onClick={() => setMobileOpen(false)} href="/about" className="py-2 hover:text-primary-600">
                About
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/consumer-services" className="py-2 hover:text-primary-600">
                Consumers
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/enterprise-services" className="py-2 hover:text-primary-600">
                Enterprises
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/howto-offerings" className="py-2 hover:text-primary-600">
                Resources
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/plans" className="py-2 hover:text-primary-600">
                Plans
              </Link>
            </nav>
            <div className="mt-4 flex items-center gap-3">
              <a
                onClick={() => setMobileOpen(false)}
                href="https://candoo.screenconnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full h-12 text-[16px] bg-accent-400 text-white hover:bg-accent-500" variant="secondary">
                  Member Support
                </Button>
              </a>
              {user ? (
                <Link onClick={() => setMobileOpen(false)} href={getDashboardLink()} className="flex-1">
                  <Button className="w-full h-12 text-[16px] text-primary-600 hover:text-primary-500" variant="ghost">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link onClick={() => setMobileOpen(false)} href="/login" className="flex-1">
                  <Button className="w-full h-12 text-[16px] text-primary-600 hover:text-primary-500" variant="ghost">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

