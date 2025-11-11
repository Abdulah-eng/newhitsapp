"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import DashboardHeader from "@/components/DashboardHeader";

export default function SeniorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always call all hooks first, before any conditional logic
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once, and only if we're sure the user is not a senior
    if (!loading && !hasRedirected.current) {
      if (!user) {
        hasRedirected.current = true;
        router.push("/login");
        return;
      }
      
      // Wait a bit for role to be fetched if user exists but role is not set yet
      if (user && user.role === undefined) {
        // Role is still being fetched, wait a bit
        const timer = setTimeout(() => {
          if (user.role !== "senior" && !hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/login");
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
      
      if (user.role !== "senior") {
        hasRedirected.current = true;
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Render conditionally in JSX instead of early returns
  return (
    <div className="min-h-screen bg-secondary-100">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : !user ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : user.role !== "senior" ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <DashboardHeader />
          <main className="min-h-screen bg-secondary-100">
            <div className="max-w-7xl mx-auto px-14 md:px-18 py-8">
              {children}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

