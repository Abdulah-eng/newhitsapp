"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, DollarSign, Star, Users, MapPin } from "lucide-react";

export default function SpecialistDashboard() {
  // Always call all hooks first, before any conditional logic
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState({ thisMonth: 0, total: 0, travelReimbursement: 0 });

  useEffect(() => {
    // Don't redirect here - the layout handles authentication
    // Just fetch data when user is available and role is confirmed
    if (!loading && user && user.role === "specialist" && user.id) {
      // Fetch data
      const fetchData = async () => {
        const { data: appsData, error: appsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("specialist_id", user.id)
          .in("status", ["pending", "confirmed"])
          .order("scheduled_at", { ascending: true })
          .limit(3);

        if (appsError) {
          console.error("Error fetching appointments:", appsError);
          setAppointments([]);
        } else if (appsData && appsData.length > 0) {
          // Fetch senior details
          const seniorIds = [...new Set(appsData.map(apt => apt.senior_id))];
          const { data: seniorsData } = await supabase
            .from("users")
            .select("id, full_name")
            .in("id", seniorIds);

          const appsWithSenior = appsData.map(apt => ({
            ...apt,
            senior: {
              full_name: seniorsData?.find(s => s.id === apt.senior_id)?.full_name || "Senior"
            }
          }));

          setAppointments(appsWithSenior || []);
        } else {
          setAppointments([]);
        }

        const { data: prof } = await supabase
          .from("specialist_profiles")
          .select("rating_average, total_reviews, total_appointments")
          .eq("user_id", user.id)
          .single();

        setProfile(prof);

        // Calculate earnings from completed appointments
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { data: completedApps } = await supabase
          .from("appointments")
          .select("duration_minutes, specialist_pay_rate, specialist_travel_reimbursement, completed_at")
          .eq("specialist_id", user.id)
          .eq("status", "completed");

        if (completedApps) {
          let thisMonthEarnings = 0;
          let totalEarnings = 0;
          let totalTravelReimbursement = 0;

          completedApps.forEach((apt) => {
            const hours = (apt.duration_minutes || 0) / 60;
            const pay = hours * (apt.specialist_pay_rate || 30);
            const travel = apt.specialist_travel_reimbursement || 0;
            
            totalEarnings += pay;
            totalTravelReimbursement += travel;

            if (apt.completed_at && new Date(apt.completed_at) >= startOfMonth) {
              thisMonthEarnings += pay + travel;
            }
          });

          setEarnings({
            thisMonth: thisMonthEarnings,
            total: totalEarnings + totalTravelReimbursement,
            travelReimbursement: totalTravelReimbursement,
          });
        }
      };

      fetchData();
    }
  }, [user, loading, router, supabase]);

  // Render conditionally in JSX instead of early returns
  // Don't check role here - the layout handles that
  if (loading || !user || user.role !== "specialist") {
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
            Manage your appointments and help seniors with technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/specialist/appointments">
            <motion.div variants={slideUp} className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
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

          <Link href="/specialist/profile">
            <motion.div variants={slideUp} className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Rating</h3>
                <Star className="text-warning-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-warning-500">
                {profile?.rating_average?.toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {profile?.total_reviews || 0} reviews
              </p>
            </motion.div>
          </Link>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Total</h3>
              <Users className="text-accent-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-accent-400">
              {profile?.total_appointments || 0}
            </p>
            <p className="text-sm text-text-tertiary mt-1">Appointments</p>
          </motion.div>

          <Link href="/specialist/earnings">
            <motion.div variants={slideUp} className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Earnings</h3>
                <DollarSign className="text-success-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-success-500">
                ${earnings.thisMonth.toFixed(2)}
              </p>
              <p className="text-sm text-text-tertiary mt-1">This month</p>
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/specialist/earnings">
            <motion.div variants={slideUp} className="card bg-white p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary">Total Earnings</h3>
                <DollarSign className="text-primary-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-primary-500">
                ${earnings.total.toFixed(2)}
              </p>
              <p className="text-sm text-text-tertiary mt-1">All time</p>
            </motion.div>
          </Link>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Travel Reimbursement</h3>
              <MapPin className="text-accent-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-accent-400">
              ${earnings.travelReimbursement.toFixed(2)}
            </p>
            <p className="text-sm text-text-tertiary mt-1">Total reimbursed</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Upcoming Appointments
              </h2>
              <Link href="/specialist/appointments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <Link key={appointment.id} href={`/specialist/appointments/${appointment.id}`}>
                    <div className="p-4 border border-secondary-200 rounded-lg hover:shadow-soft transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text-primary">
                          {appointment.senior?.full_name || "Client"}
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
                  No upcoming appointments scheduled yet.
                </p>
                <Link href="/specialist/calendar">
                  <Button variant="primary">Manage Availability</Button>
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
              <Link href="/specialist/calendar">
                <Button variant="primary" size="lg" className="w-full">
                  Manage Calendar
                </Button>
              </Link>
              <Link href="/specialist/earnings">
                <Button variant="secondary" size="lg" className="w-full">
                  View Earnings
                </Button>
              </Link>
              <Link href="/specialist/appointments">
                <Button variant="secondary" size="lg" className="w-full">
                  View All Appointments
                </Button>
              </Link>
              <Link href="/specialist/profile">
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

