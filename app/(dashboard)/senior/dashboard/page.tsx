"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, MessageSquare, User, Clock } from "lucide-react";

export default function SeniorDashboard() {
  // Always call all hooks first, before any conditional logic
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
            Welcome back, {user.user_metadata?.full_name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-xl text-text-secondary">
            Here's what's happening with your tech support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={slideUp}
            className="card bg-white p-6"
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

          <motion.div
            variants={slideUp}
            className="card bg-white p-6"
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

          <motion.div
            variants={slideUp}
            className="card bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Profile</h3>
              <User className="text-secondary-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-secondary-600">100%</p>
            <p className="text-sm text-text-tertiary mt-1">Complete</p>
          </motion.div>

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
                  <div
                    key={appointment.id}
                    className="p-4 border border-secondary-200 rounded-lg hover:shadow-soft transition-shadow"
                  >
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">
                  No upcoming appointments
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
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

