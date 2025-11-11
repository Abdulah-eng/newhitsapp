"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";

interface DashboardHeaderProps {
  showNavLinks?: boolean;
  navLinks?: Array<{ href: string; label: string }>;
}

export default function DashboardHeader({ showNavLinks = false, navLinks = [] }: DashboardHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  return (
    <header className="z-40 bg-white">
      <div className="max-w-7xl mx-auto px-14 md:px-18">
        <div className="flex items-center justify-between py-8 md:py-10">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border-4 border-primary-500 flex items-center justify-center bg-white shadow-soft">
              <span className="text-primary-600 font-extrabold text-xl">H</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary-600 tracking-tight">HITSapp</p>
              <p className="text-sm text-text-secondary">Hire IT Specialists</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          {showNavLinks && navLinks.length > 0 && (
            <nav className="hidden lg:flex items-center gap-7 text-[18px] font-semibold text-primary-900">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-5">
            {user && (
              <>
                <span className="text-[18px] font-semibold text-primary-900">
                  {getUserName()}
                </span>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={signOut}
                  className="text-[18px] font-semibold text-primary-600 hover:text-primary-500 px-4"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
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
        <div className="lg:hidden bg-white border-t border-secondary-200">
          <div className="max-w-7xl mx-auto px-12 md:px-16 py-6">
            {showNavLinks && navLinks.length > 0 && (
              <nav className="grid gap-3 text-[18px] font-semibold text-primary-900 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    onClick={() => setMobileOpen(false)}
                    href={link.href}
                    className="py-2 hover:text-primary-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
            {user && (
              <div className="flex flex-col gap-3">
                <div className="py-2">
                  <p className="text-[18px] font-semibold text-primary-900">{getUserName()}</p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="w-full text-[18px] font-semibold text-primary-600 hover:text-primary-500 justify-start"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

