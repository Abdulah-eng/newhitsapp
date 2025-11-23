"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";

export default function SpecialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always call all hooks first, before any conditional logic
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log("SpecialistLayout: loading =", loading, "user =", user ? "exists" : "null", "role =", user?.role);
    
    // Only redirect once, and only if we're sure the user is not a specialist
    if (!loading && !hasRedirected.current) {
      if (!user) {
        console.log("SpecialistLayout: No user, redirecting to login");
        hasRedirected.current = true;
        router.push("/login");
        return;
      }
      
      // If role is undefined, it's still being fetched - wait a bit longer
      if (user.role === undefined) {
        console.log("SpecialistLayout: Role is undefined, waiting...");
        // Role is still being fetched, wait a bit more
        const timer = setTimeout(() => {
          // Re-check after timeout - if still undefined, redirect to login
          // This handles cases where role fetch fails
          if (!hasRedirected.current) {
            console.log("SpecialistLayout: Role still undefined after timeout, redirecting");
            // Force a check - if role is still undefined after timeout, redirect
            hasRedirected.current = true;
            router.push("/login");
          }
        }, 3000); // Increased timeout to 3 seconds to allow for retries
        return () => clearTimeout(timer);
      }
      
      // Role is defined but not specialist - redirect to appropriate dashboard
      if (user.role !== "specialist") {
        console.log("SpecialistLayout: Role is not specialist (" + user.role + "), redirecting");
        hasRedirected.current = true;
        if (user.role === "senior") {
          router.replace("/senior/dashboard");
        } else {
          router.replace("/login");
        }
      } else {
        console.log("SpecialistLayout: User is specialist, rendering dashboard");
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
      ) : user.role === undefined ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : user.role !== "specialist" ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary mb-4">Redirecting...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        </div>
      ) : (
        <>
          <DashboardHeader />
          <main className="min-h-screen bg-secondary-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-14 py-4 sm:py-6 md:py-8">
              {children}
            </div>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

