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
    if (user.role === "admin" || user.email?.toLowerCase() === "admin@hitspecialist.com") {
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
      <div className="w-full px-4 sm:px-6 md:px-10">
        <div className="flex items-center justify-between gap-4 sm:gap-6 md:gap-8 py-4 sm:py-6 md:py-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-primary-500 flex items-center justify-center bg-white shadow-soft">
              <span className="text-primary-600 font-extrabold text-sm sm:text-base md:text-xl">H</span>
            </div>
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-primary-600 tracking-tight">HITS</p>
              <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">Hire IT Specialists</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1 flex-nowrap items-center justify-center gap-6 text-[17px] font-semibold text-primary-900 whitespace-nowrap">
            <Link href="/about" className="hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/for-seniors-families" className="hover:text-primary-600 transition-colors">
              For Seniors & Families
            </Link>
            <Link href="/for-partners" className="hover:text-primary-600 transition-colors">
              For Partners
            </Link>
            <Link href="/resources" className="hover:text-primary-600 transition-colors">
              Resources
            </Link>
            <Link href="/plans" className="hover:text-primary-600 transition-colors">
              Pricing & Plans
            </Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">
              Contact / Support
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/specialists?search=true">
              <Button
                size="lg"
                variant="ghost"
                className="px-6 h-12 text-[16px] text-primary-700 hover:text-primary-600"
              >
                Find Specialist
              </Button>
            </Link>
            {user ? (
              <Link href={getDashboardLink()}>
                <Button
                  size="lg"
                  className="px-6 h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="px-6 h-12 text-[16px] text-primary-700 hover:text-primary-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="px-6 h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-6">
            <nav className="grid gap-3 text-[18px] font-semibold text-primary-900">
              <Link onClick={() => setMobileOpen(false)} href="/about" className="py-2 hover:text-primary-600">
                About
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/for-seniors-families" className="py-2 hover:text-primary-600">
                For Seniors & Families
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/for-partners" className="py-2 hover:text-primary-600">
                For Partners
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/resources" className="py-2 hover:text-primary-600">
                Resources
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/plans" className="py-2 hover:text-primary-600">
                Pricing & Plans
              </Link>
              <Link onClick={() => setMobileOpen(false)} href="/contact" className="py-2 hover:text-primary-600">
                Contact / Support
              </Link>
            </nav>
            <div className="mt-4 space-y-3">
              <Link onClick={() => setMobileOpen(false)} href="/specialists?search=true" className="block">
                <Button variant="ghost" className="w-full h-12 text-[16px] text-primary-700 hover:text-primary-600">
                  Find Specialist
                </Button>
              </Link>
              {user ? (
                <Link onClick={() => setMobileOpen(false)} href={getDashboardLink()} className="block">
                  <Button className="w-full h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link onClick={() => setMobileOpen(false)} href="/login" className="block">
                    <Button variant="ghost" className="w-full h-12 text-[16px] text-primary-700 hover:text-primary-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link onClick={() => setMobileOpen(false)} href="/register" className="block">
                    <Button className="w-full h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

