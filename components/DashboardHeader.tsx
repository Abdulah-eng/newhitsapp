"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AccountSettingsMenu from "@/components/account/AccountSettingsMenu";
import ChangePasswordModal from "@/components/account/ChangePasswordModal";
import Button from "@/components/ui/Button";
import { useUnreadMessageCount } from "@/lib/hooks/useUnreadMessageCount";

interface DashboardHeaderProps {
  showNavLinks?: boolean;
  navLinks?: Array<{ href: string; label: string }>;
}

export default function DashboardHeader({ showNavLinks = false, navLinks = [] }: DashboardHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { count: unreadCount } = useUnreadMessageCount(20000);

  const messagesHref = useMemo(() => {
    if (!user?.role) return null;
    if (user.role === "senior") return "/senior/messages";
    if (user.role === "specialist") return "/specialist/messages";
    return null;
  }, [user?.role]);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  return (
    <header className="z-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-14">
        <div className="flex items-center justify-between py-4 sm:py-6 md:py-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-primary-500 flex items-center justify-center bg-white shadow-soft">
              <span className="text-primary-600 font-extrabold text-sm sm:text-base md:text-xl">H</span>
            </div>
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-primary-600 tracking-tight">HITSapp</p>
              <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">Hire IT Specialists</p>
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
                {messagesHref && (
                  <Link
                    href={messagesHref}
                    className="relative text-[16px] font-semibold text-primary-700 hover:text-primary-500 transition-colors"
                  >
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-bold text-white bg-primary-500 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <span className="ml-1 text-xs text-primary-600 font-semibold">New</span>
                    )}
                  </Link>
                )}
                <span className="text-[18px] font-semibold text-primary-900">
                  {getUserName()}
                </span>
                <AccountSettingsMenu align="right" />
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
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
                {messagesHref && (
                  <Link
                    href={messagesHref}
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg border border-secondary-200 text-[16px] font-semibold text-primary-700 hover:bg-primary-50"
                  >
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold text-white bg-primary-500 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileModalOpen(true);
                  }}
                  className="w-full text-left text-[18px] font-semibold text-text-primary hover:text-primary-500 justify-start"
                >
                  Change Password
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="w-full text-left text-[18px] font-semibold text-error-600 hover:text-error-500 justify-start"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ChangePasswordModal open={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </header>
  );
}

