"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

interface AuthUser extends User {
  role?: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let mounted = true;

    // Extract role from user metadata, or check email for admin, or fetch from DB
    const withRole = async (u: User | null): Promise<AuthUser | null> => {
      if (!u) return null;
      
      // First check user_metadata
      let role = (u.user_metadata?.role as UserRole | undefined);
      
      // If no role in metadata, check if admin email
      if (!role && u.email?.toLowerCase() === "admin@hitsapp.com") {
        role = "admin";
      }
      
      // If still no role, try to fetch from database
      if (!role) {
        try {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", u.id)
            .single();
          if (data?.role) {
            role = data.role as UserRole;
          }
        } catch (error) {
          // Silently fail - role will remain undefined
          console.error("Error fetching user role:", error);
        }
      }
      
      return { ...u, role };
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data?.session ?? null;
      const userWithRole = await withRole(session?.user ?? null);
      if (mounted) {
        setUser(userWithRole);
        setLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const userWithRole = await withRole(session?.user ?? null);
      if (mounted) {
        setUser(userWithRole);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}

