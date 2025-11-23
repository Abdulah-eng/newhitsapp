import { useState, useEffect, useCallback, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Helper function to log activities
async function logActivity(type: string, description: string, metadata: any) {
  try {
    await fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, description, metadata }),
    });
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}

export interface MembershipPlan {
  id: string;
  plan_type: "connect" | "comfort" | "family_care_plus" | "starter" | "essential" | "family";
  name: string;
  monthly_price: number;
  member_hourly_rate: number;
  included_visit_minutes: number;
  included_visit_type: string | null;
  priority_scheduling: boolean;
  resource_library_access: boolean;
  caregiver_notifications: boolean;
  family_view: boolean;
  max_covered_people: number;
  description: string;
  features: string[];
  service_category: "online-only" | "in-person";
  is_active: boolean;
}

export interface UserMembership {
  id: string;
  user_id: string;
  membership_plan_id: string;
  status: "active" | "cancelled" | "expired" | "pending";
  started_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  next_billing_date: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  covered_user_ids: string[];
  cancellation_requested_at?: string | null;
  cancellation_effective_date?: string | null;
  reactivated_at?: string | null;
  reactivated_from_membership_id?: string | null;
  membership_plan?: MembershipPlan;
}

export function useMembership(userId: string | undefined, category?: "online-only" | "in-person") {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();
  const lastFetchTimeRef = useRef<number>(0);
  const membershipIdRef = useRef<string | null>(null);

  // Fetch all available membership plans
  // Optionally filter by service_category (online-only or in-person)
  const fetchPlans = useCallback(async (category?: "online-only" | "in-person") => {
    try {
      const categoryParam = category ? `?category=${category}` : "";
      const response = await fetch(`/api/membership/plans${categoryParam}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch plans");
      }

      setPlans(result.plans || []);
    } catch (err) {
      console.error("Error fetching membership plans:", err);
      setError("Failed to load membership plans");
    }
  }, []);

  // Fetch plans filtered by category if provided
  useEffect(() => {
    fetchPlans(category);
  }, [fetchPlans, category]);

  // Fetch user's active membership function (memoized with useCallback)
  const fetchMembershipData = useCallback(async () => {
    if (!userId) return;
    
    // Throttle: don't fetch if we fetched in the last 3 seconds
    // This prevents rapid-fire fetches from real-time subscriptions
    const now = Date.now();
    if (lastFetchTimeRef.current && now - lastFetchTimeRef.current < 3000) {
      // Don't log throttling - it's expected behavior
      return;
    }
    
    lastFetchTimeRef.current = now;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: membershipError } = await supabase
        .from("user_memberships")
        .select(`
          *,
          membership_plan:membership_plans(*)
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (membershipError) throw membershipError;

      if (data) {
        // Parse features JSONB
        const plan = data.membership_plan as any;
        if (plan && plan.features) {
          plan.features = Array.isArray(plan.features) ? plan.features : [];
        }

        // Only log if membership actually changed
        if (membershipIdRef.current !== data.id) {
          console.log("Membership data loaded:", {
            membershipId: data.id,
            status: data.status,
            hasPlan: !!plan,
            planName: plan?.name,
          });
          membershipIdRef.current = data.id;
        }

        setMembership(data as UserMembership);
      } else {
        // Only log if we had a membership before
        if (membershipIdRef.current) {
          console.log("No active membership found for user:", userId);
          membershipIdRef.current = null;
        }
        setMembership(null);
      }
    } catch (err) {
      console.error("Error fetching membership:", err);
      setError("Failed to load membership");
      setMembership(null);
      membershipIdRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  // Fetch user's active membership
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let subscriptionChannel: any = null;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Initial fetch
    fetchMembershipData();

    // Set up real-time subscription to listen for membership changes
    subscriptionChannel = supabase
      .channel(`user_memberships:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "user_memberships",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Only refresh if this is a meaningful change
          const newStatus = (payload.new as any)?.status;
          const oldStatus = (payload.old as any)?.status;
          const newMembershipId = (payload.new as any)?.id;
          const oldMembershipId = (payload.old as any)?.id;
          
          // Refresh on INSERT (new membership created)
          // Refresh on UPDATE if status changed or membership ID changed
          // Refresh on DELETE (membership removed)
          const shouldRefresh = 
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE" ||
            (payload.eventType === "UPDATE" && (
              newStatus !== oldStatus || 
              newMembershipId !== oldMembershipId ||
              (newStatus === "active" && oldStatus !== "active")
            ));
          
          if (shouldRefresh && isMounted) {
            // Clear any pending refresh
            if (refreshTimeout) {
              clearTimeout(refreshTimeout);
            }
            
            // Use a delay to avoid rapid-fire updates and allow database to settle
            refreshTimeout = setTimeout(() => {
              if (isMounted) {
                fetchMembershipData();
              }
            }, 1500);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [userId, fetchMembershipData, supabase]);

  const createMembership = async (planId: string) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const { data, error: createError } = await supabase
        .from("user_memberships")
        .insert({
          user_id: userId,
          membership_plan_id: planId,
          status: "active",
          started_at: new Date().toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select(`
          *,
          membership_plan:membership_plans(*)
        `)
        .single();

      if (createError) throw createError;

      // Update senior profile with membership_id
      await supabase
        .from("senior_profiles")
        .update({ membership_id: data.id })
        .eq("user_id", userId);

      // Parse features
      const plan = data.membership_plan as any;
      if (plan && plan.features) {
        plan.features = Array.isArray(plan.features) ? plan.features : [];
      }

      // Log membership creation
      await logActivity(
        "membership_created",
        `Membership created: ${plan?.name || "Unknown"} plan`,
        {
          membership_id: data.id,
          plan_type: plan?.plan_type || "unknown",
          monthly_price: plan?.monthly_price || 0,
        }
      );

      setMembership(data as UserMembership);
      return data;
    } catch (err) {
      console.error("Error creating membership:", err);
      throw err;
    }
  };

  const cancelMembership = async (reason?: string) => {
    if (!membership) {
      throw new Error("No active membership to cancel");
    }

    try {
      const { error: cancelError } = await supabase
        .from("user_memberships")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_requested_at: new Date().toISOString(),
          cancellation_effective_date: new Date().toISOString().split("T")[0],
          cancellation_reason: reason || null,
          reactivated_at: null,
          reactivated_from_membership_id: null,
        })
        .eq("id", membership.id);

      if (cancelError) throw cancelError;

      // Remove membership_id from senior profile
      await supabase
        .from("senior_profiles")
        .update({ membership_id: null })
        .eq("user_id", userId);

      // Log membership cancellation
      await logActivity(
        "membership_cancelled",
        `Membership cancelled: ${membership.id}`,
        {
          membership_id: membership.id,
          cancellation_reason: reason || "User requested cancellation",
        }
      );

      setMembership(null);
    } catch (err) {
      console.error("Error cancelling membership:", err);
      throw err;
    }
  };

  const fetchMembership = async () => {
    await fetchMembershipData();
  };

  return {
    membership,
    plans,
    isLoading,
    error,
    createMembership,
    cancelMembership,
    fetchMembership,
    fetchPlans,
    hasActiveMembership: !!membership && membership.status === "active",
  };
}

