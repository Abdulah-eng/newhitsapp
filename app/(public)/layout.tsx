"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-secondary-100">
      <nav className="bg-white shadow-soft border-b border-secondary-200">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg sm:text-xl font-bold text-primary-500">
              HITS
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Link href="/specialists">
                <Button variant="ghost" size="sm">
                  Find Specialists
                </Button>
              </Link>
              {user ? (
                <>
                  <Link href={user.role === "senior" ? "/senior/dashboard" : "/specialist/dashboard"}>
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

