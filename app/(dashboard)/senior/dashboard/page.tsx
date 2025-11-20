"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, MessageSquare, User, Clock, Crown } from "lucide-react";
import { useMembership } from "@/lib/hooks/useMembership";

export default function SeniorDashboard() {
  // Always call all hooks first, before any conditional logic
  const { user, loading } = useAuth();
  const { membership, hasActiveMembership, fetchMembership, isLoading: membershipLoading } = useMembership(user?.id);

  // Debug logging for membership (throttled to avoid spam)
  useEffect(() => {
    if (user?.id && membership) {
      const logKey = `membership_log_${membership.id}`;
      const lastLog = sessionStorage.getItem(logKey);
      const now = Date.now();
      
      // Only log if we haven't logged this membership state in the last 5 seconds
      if (!lastLog || now - parseInt(lastLog) > 5000) {
        console.log("Dashboard membership state:", {
          hasMembership: !!membership,
          hasActiveMembership,
          membershipStatus: membership?.status,
          hasPlan: !!membership?.membership_plan,
          planName: membership?.membership_plan?.name,
          isLoading: membershipLoading,
        });
        sessionStorage.setItem(logKey, now.toString());
      }
    }
  }, [membership?.id, hasActiveMembership, membershipLoading, user?.id]);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refresh membership when page becomes visible (user returns from membership page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user?.id && fetchMembership) {
        // Small delay to ensure any database updates have propagated
        setTimeout(() => {
          fetchMembership();
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Also refresh when component mounts (user navigates to dashboard)
    if (user?.id && fetchMembership) {
      // Small delay to allow any pending updates to complete
      const timer = setTimeout(() => {
        fetchMembership();
      }, 1000);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id, fetchMembership]);

  useEffect(() => {
    // Don't redirect here - the layout handles authentication
    // Just fetch data when user is available and role is confirmed
    if (!loading && user && user.role === "senior" && user.id) {
      // Fetch appointments
      const fetchData = async () => {
        const { data: appsData, error: appsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("senior_id", user.id)
          .in("status", ["pending", "confirmed"])
          .order("scheduled_at", { ascending: true })
          .limit(3);

        if (appsError) {
          console.error("Error fetching appointments:", appsError);
          setAppointments([]);
        } else if (appsData && appsData.length > 0) {
          // Fetch specialist details
          const specialistIds = [...new Set(appsData.map(apt => apt.specialist_id))];
          const { data: specialistsData } = await supabase
            .from("users")
            .select("id, full_name")
            .in("id", specialistIds);

          const appsWithSpecialist = appsData.map(apt => ({
            ...apt,
            specialist: {
              full_name: specialistsData?.find(s => s.id === apt.specialist_id)?.full_name || "Specialist"
            }
          }));

          setAppointments(appsWithSpecialist || []);
        } else {
          setAppointments([]);
        }

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .is("read_at", null);

        setUnreadCount(count || 0);
      };

      fetchData();
    }
  }, [user, loading, router, supabase]);

  // Render conditionally in JSX instead of early returns
  // Don't check role here - the layout handles that
  if (loading || !user || user.role !== "senior") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Welcome back, {(user.user_metadata?.full_name || user.full_name || "User").split(" ")[0]}!
          </h1>
          <p className="text-xl text-text-secondary">
            Here's what's happening with your tech support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Membership Card - Show if membership exists and is active */}
          {membershipLoading ? (
            <motion.div
              variants={slideUp}
              className="card bg-secondary-50 border-2 border-dashed border-secondary-300 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Membership</h3>
                <Crown className="text-text-tertiary" size={24} />
              </div>
              <p className="text-sm text-text-tertiary">Loading...</p>
            </motion.div>
          ) : hasActiveMembership && membership ? (
            <motion.div
              variants={slideUp}
              className="card bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/90">Membership</h3>
                <Crown className="text-white" size={24} />
              </div>
              <p className="text-xl font-bold text-white mb-1">
                {membership.membership_plan?.name || "Active Plan"}
              </p>
              <p className="text-sm text-white/80 mt-1">Active</p>
              <Link href="/senior/membership" className="mt-3 inline-block">
                <span className="text-sm text-white underline">Manage →</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={slideUp}
              className="card bg-secondary-50 border-2 border-dashed border-secondary-300 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Membership</h3>
                <Crown className="text-text-tertiary" size={24} />
              </div>
              <p className="text-lg font-semibold text-text-primary mb-2">
                No Active Plan
              </p>
              <Link href="/senior/membership">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Plans
                </Button>
              </Link>
            </motion.div>
          )}
          <Link href="/senior/my-appointments">
            <motion.div
              variants={slideUp}
              className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Upcoming</h3>
                <Calendar className="text-primary-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-primary-500">
                {appointments?.length || 0}
              </p>
              <p className="text-sm text-text-tertiary mt-1">Appointments</p>
            </motion.div>
          </Link>

          <Link href="/senior/messages">
            <motion.div
              variants={slideUp}
              className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Messages</h3>
                <MessageSquare className="text-accent-400" size={24} />
              </div>
              <p className="text-3xl font-bold text-accent-400">
                {unreadCount || 0}
              </p>
              <p className="text-sm text-text-tertiary mt-1">Unread</p>
            </motion.div>
          </Link>

          <Link href="/senior/profile">
            <motion.div
              variants={slideUp}
              className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Profile</h3>
                <User className="text-secondary-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-secondary-600">100%</p>
              <p className="text-sm text-text-tertiary mt-1">Complete</p>
            </motion.div>
          </Link>

          <motion.div
            variants={slideUp}
            className="card bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">This Month</h3>
              <Clock className="text-success-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-success-500">0</p>
            <p className="text-sm text-text-tertiary mt-1">Completed</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Upcoming Appointments
              </h2>
              <Link href="/senior/my-appointments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <Link key={appointment.id} href={`/senior/my-appointments/${appointment.id}`}>
                    <div className="p-4 border border-secondary-200 rounded-lg hover:shadow-soft transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text-primary">
                          {appointment.specialist?.full_name || "Specialist"}
                        </h3>
                        <span className="text-sm px-2 py-1 bg-primary-50 text-primary-600 rounded">
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-1">
                        {new Date(appointment.scheduled_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-text-tertiary line-clamp-2">
                        {appointment.issue_description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary mb-4">
                  No appointments scheduled yet.
                </p>
                <Link href="/senior/book-appointment">
                  <Button variant="primary">Book Your First Appointment</Button>
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Quick Actions
              </h2>
            </div>
            <div className="space-y-4">
              <Link href="/senior/book-appointment">
                <Button variant="primary" size="lg" className="w-full">
                  Book New Appointment
                </Button>
              </Link>
              <Link href="/senior/messages">
                <Button variant="secondary" size="lg" className="w-full">
                  View Messages
                </Button>
              </Link>
              <Link href="/senior/profile">
                <Button variant="outline" size="lg" className="w-full">
                  Update Profile
                </Button>
              </Link>
              {hasActiveMembership && (
                <Link href="/senior/resources">
                  <Button variant="outline" size="lg" className="w-full">
                    Resource Library
                  </Button>
                </Link>
              )}
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full">
                  Contact Support / Report a Concern
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

