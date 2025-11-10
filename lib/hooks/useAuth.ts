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

  // Extract role directly from user metadata to avoid DB queries
  const withRole = (u: User | null): AuthUser | null => {
    if (!u) return null;
    const metaRole = (u.user_metadata?.role as UserRole | undefined) || undefined;
    return { ...u, role: metaRole };
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data?.session ?? null;
      setUser(withRole(session?.user ?? null));
      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(withRole(session?.user ?? null));
      setLoading(false);
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

