"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp } from "@/lib/animations/config";
import {
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface DashboardStats {
  totalUsers: number;
  totalSpecialists: number;
  totalSeniors: number;
  disabledAdults: number;
  activeMemberships: number;
  pendingVerifications: number;
  totalAppointments: number;
  appointmentsToday: number;
  totalRevenue: number;
  netRevenue: number;
  openDisputes: number;
  recentTransactions: any[];
  pendingSpecialists: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSpecialists: 0,
    totalSeniors: 0,
    disabledAdults: 0,
    activeMemberships: 0,
    pendingVerifications: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    totalRevenue: 0,
    netRevenue: 0,
    openDisputes: 0,
    recentTransactions: [],
    pendingSpecialists: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Admin Dashboard: Fetching data...");

        // Fetch user counts and metrics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();
        const tomorrowISO = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

        const [
          usersRes,
          specialistsRes,
          seniorsRes,
          disabledAdultsRes,
          membershipsRes,
          appointmentsRes,
          appointmentsTodayRes,
          paymentsRes,
          disputesRes,
          pendingCountRes,
        ] = await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "specialist"),
          supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "senior"),
          supabase.from("senior_profiles").select("id", { count: "exact", head: true }).eq("is_disabled_adult", true),
          supabase.from("user_memberships").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("appointments").select("id", { count: "exact", head: true }),
          supabase.from("appointments").select("id", { count: "exact", head: true })
            .gte("scheduled_at", todayISO)
            .lt("scheduled_at", tomorrowISO),
          supabase.from("payments").select("amount, base_amount, travel_fee, membership_discount").eq("status", "completed"),
          supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("specialist_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
        ]);

        // Log errors for debugging
        if (usersRes.error) console.error("Error fetching users:", usersRes.error);
        if (specialistsRes.error) console.error("Error fetching specialists:", specialistsRes.error);
        if (seniorsRes.error) console.error("Error fetching seniors:", seniorsRes.error);
        if (appointmentsRes.error) console.error("Error fetching appointments:", appointmentsRes.error);
        if (paymentsRes.error) console.error("Error fetching payments:", paymentsRes.error);

        // Fetch pending specialists separately with better error handling
        // First, let's check all specialist profiles to see what we have
        // Try with RLS bypass check
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from("specialist_profiles")
          .select("*")
          .limit(10);
        
        console.log("All specialist profiles:", allProfiles);
        console.log("All profiles error:", allProfilesError);
        
        // Also check if we can query by user_id directly
        if (specialistsRes.count && specialistsRes.count > 0) {
          // Get the specialist user IDs with full details
          const { data: specialistUsers, error: specialistUsersError } = await supabase
            .from("users")
            .select("id, email, full_name, role")
            .eq("role", "specialist");
          
          console.log("Specialist user IDs:", specialistUsers);
          console.log("Specialist users error:", specialistUsersError);
          
          if (specialistUsers && specialistUsers.length > 0) {
            const specialistIds = specialistUsers.map(u => u.id);
            console.log("Querying profiles for user_ids:", specialistIds);
            
            // Try querying without any filters first
            const { data: allProfilesTest, error: allProfilesTestError } = await supabase
              .from("specialist_profiles")
              .select("*");
            
            console.log("All profiles (no filter):", allProfilesTest);
            console.log("All profiles error (no filter):", allProfilesTestError);
            
            // Then try with user_ids
            const { data: profilesByUserId, error: profilesError } = await supabase
              .from("specialist_profiles")
              .select("*")
              .in("user_id", specialistIds);
            
            console.log("Profiles by user_id:", profilesByUserId);
            console.log("Profiles error:", profilesError);
            
            // Check if profiles exist for these users
            specialistUsers.forEach((user) => {
              const hasProfile = profilesByUserId?.some(p => p.user_id === user.id);
              console.log(`User ${user.email} (${user.id}): has profile = ${hasProfile}`);
            });
          }
        }
        
        if (allProfiles) {
          console.log("Verification statuses:", allProfiles.map(p => ({
            id: p.id,
            user_id: p.user_id,
            status: p.verification_status
          })));
        }

        // Query specialist_profiles and join with users table
        const { data: pendingProfiles, error: pendingError } = await supabase
          .from("specialist_profiles")
          .select("*")
          .eq("verification_status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);
        
        console.log("Pending profiles query result:", pendingProfiles);
        console.log("Pending profiles error:", pendingError);

        // Fetch user details for each pending specialist
        let pendingData: any[] = [];
        if (pendingProfiles && !pendingError) {
          const userIds = pendingProfiles.map((p) => p.user_id);
          if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from("users")
              .select("id, full_name, email")
              .in("id", userIds);

            if (!usersError && usersData) {
              // Combine specialist profiles with user data
              pendingData = pendingProfiles.map((profile) => ({
                ...profile,
                user: usersData.find((u) => u.id === profile.user_id) || null,
              }));
            } else {
              console.error("Error fetching user details:", usersError);
              // Use profiles without user data
              pendingData = pendingProfiles.map((profile) => ({
                ...profile,
                user: null,
              }));
            }
          }
        }

        if (pendingError) {
          console.error("Error fetching pending specialists:", pendingError);
        } else {
          console.log("Pending specialists found:", pendingData?.length || 0, pendingData);
        }

        // Fetch recent transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from("payments")
          .select(`
            *,
            appointment:appointments(id, senior_id, specialist_id)
          `)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(5);

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
        }

        const totalUsers = usersRes.count || 0;
        const totalSpecialists = specialistsRes.count || 0;
        const totalSeniors = seniorsRes.count || 0;
        const totalAppointments = appointmentsRes.count || 0;
        // Use count from query, fallback to data length
        const pendingVerifications = pendingCountRes.count ?? pendingData?.length ?? 0;

        // Calculate total revenue and net revenue
        let totalRevenue = 0;
        let netRevenue = 0;
        if (paymentsRes.data) {
          paymentsRes.data.forEach((payment: any) => {
            totalRevenue += parseFloat(payment.amount || 0);
            netRevenue += parseFloat(payment.base_amount || payment.amount || 0);
          });
        }

        console.log("Dashboard stats:", {
          totalUsers,
          totalSpecialists,
          totalSeniors,
          disabledAdults: disabledAdultsRes.count,
          activeMemberships: membershipsRes.count,
          pendingVerifications,
          totalAppointments,
          appointmentsToday: appointmentsTodayRes.count,
          totalRevenue,
          netRevenue,
          openDisputes: disputesRes.count,
        });

        setStats({
          totalUsers,
          totalSpecialists,
          totalSeniors,
          disabledAdults: disabledAdultsRes.count || 0,
          activeMemberships: membershipsRes.count || 0,
          pendingVerifications,
          totalAppointments,
          appointmentsToday: appointmentsTodayRes.count || 0,
          totalRevenue,
          netRevenue,
          openDisputes: disputesRes.count || 0,
          recentTransactions: transactions || [],
          pendingSpecialists: pendingData || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary-500",
      bgColor: "bg-primary-50",
      link: "/admin/users",
    },
    {
      title: "Specialists",
      value: stats.totalSpecialists,
      icon: Users,
      color: "text-accent-500",
      bgColor: "bg-accent-50",
      link: "/admin/users?filter=specialists",
    },
    {
      title: "Seniors",
      value: stats.totalSeniors,
      icon: Users,
      color: "text-success-500",
      bgColor: "bg-success-50",
      link: "/admin/users?filter=seniors",
    },
    {
      title: "Disabled Adults",
      value: stats.disabledAdults,
      icon: Users,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
    },
    {
      title: "Active Memberships",
      value: stats.activeMemberships,
      icon: TrendingUp,
      color: "text-accent-600",
      bgColor: "bg-accent-100",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: Clock,
      color: "text-warning-500",
      bgColor: "bg-warning-50",
      link: "/admin/users?filter=pending",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "text-primary-500",
      bgColor: "bg-primary-50",
      link: "/admin/appointments",
    },
    {
      title: "Appointments Today",
      value: stats.appointmentsToday,
      icon: Calendar,
      color: "text-accent-500",
      bgColor: "bg-accent-50",
      link: "/admin/appointments",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success-500",
      bgColor: "bg-success-50",
      link: "/admin/payments",
    },
    {
      title: "Net Revenue",
      value: `$${stats.netRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success-600",
      bgColor: "bg-success-100",
      link: "/admin/payments",
    },
    {
      title: "Open Disputes",
      value: stats.openDisputes,
      icon: AlertCircle,
      color: "text-error-500",
      bgColor: "bg-error-50",
      link: "/admin/disputes",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
      >
        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xl text-text-secondary">
            Platform overview and key metrics
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const CardContent = (
              <motion.div
                variants={slideUp}
                className="card bg-white p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-text-primary">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={card.color} size={24} />
                  </div>
                </div>
              </motion.div>
            );

            return card.link ? (
              <Link key={index} href={card.link}>
                {CardContent}
              </Link>
            ) : (
              <div key={index}>{CardContent}</div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Verifications */}
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Pending Verifications</h2>
              <Link href="/admin/users?filter=pending">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {stats.pendingSpecialists.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <CheckCircle size={48} className="mx-auto mb-4 text-success-500 opacity-50" />
                <p>No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.pendingSpecialists.map((specialist: any) => (
                  <div
                    key={specialist.id}
                    className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          {specialist.user?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {specialist.user?.email || ""}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Specialties: {specialist.specialties?.join(", ") || "None"}
                        </p>
                      </div>
                      <Link href={`/admin/users?specialist=${specialist.user_id}`}>
                        <Button variant="primary" size="sm">Review</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Recent Transactions</h2>
              <Link href="/admin/payments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <DollarSign size={48} className="mx-auto mb-4 text-primary-500 opacity-50" />
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="p-4 border border-secondary-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">
                          ${transaction.amount?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-success-500" />
                        <span className="text-sm text-success-600 font-medium">Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

