import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

/**
 * Get the current authenticated user on the server
 */
export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerComponentClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Fetch user role from database
    // Use try-catch to handle cases where user doesn't exist in users table yet
    try {
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("role, full_name, email")
        .eq("id", user.id)
        .single();

      // If user doesn't exist in users table yet, return user without role
      // This can happen during registration before profile is created
      if (dbError) {
        // PGRST116 is "no rows returned" - this is expected for new users
        if (dbError.code === "PGRST116") {
          return {
            ...user,
            role: undefined,
            full_name: undefined,
          };
        }
        // Other errors should be logged but not crash
        console.error("Error fetching user data:", dbError);
        return {
          ...user,
          role: undefined,
          full_name: undefined,
        };
      }

      return {
        ...user,
        role: userData?.role as UserRole | undefined,
        full_name: userData?.full_name,
      };
    } catch (dbError) {
      // If database query fails, return user without role
      return {
        ...user,
        role: undefined,
        full_name: undefined,
      };
    }
  } catch (error) {
    // If anything fails, return null to prevent crashes
    console.error("getCurrentUser error:", error);
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require specific role - redirects to appropriate dashboard
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!user.role || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "senior") {
      redirect("/senior/dashboard");
    } else if (user.role === "specialist") {
      redirect("/specialist/dashboard");
    } else {
      redirect("/");
    }
  }
  return user;
}

/**
 * Redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "senior") {
      redirect("/senior/dashboard");
    } else if (user.role === "specialist") {
      redirect("/specialist/dashboard");
    } else if (user.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/");
    }
  }
}

