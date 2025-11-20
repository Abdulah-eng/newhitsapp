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
        // Role is still being fetched, wait longer to allow DB fetch to complete
        const timer = setTimeout(() => {
          // Re-check user.role after timeout - it might have been loaded
          if (user.role !== "senior" && !hasRedirected.current) {
            hasRedirected.current = true;
            if (user.role === "specialist") {
              router.replace("/specialist/dashboard");
            } else if (user.role === "admin") {
              router.replace("/admin/dashboard");
            } else {
              router.push("/login");
            }
          }
        }, 3000); // Increased timeout to allow DB fetch
        return () => clearTimeout(timer);
      }
      
      // Role is defined - check and redirect if not senior
      if (user.role !== "senior") {
        hasRedirected.current = true;
        if (user.role === "specialist") {
          router.replace("/specialist/dashboard");
        } else if (user.role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.push("/login");
        }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-14 py-4 sm:py-6 md:py-8">
              {children}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

