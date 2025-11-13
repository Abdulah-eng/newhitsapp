"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { DollarSign, Calendar, MapPin, TrendingUp, ArrowLeft, Download } from "lucide-react";

interface EarningsData {
  thisMonth: number;
  lastMonth: number;
  total: number;
  travelReimbursement: number;
  totalTravelReimbursement: number;
  completedAppointments: number;
  thisMonthAppointments: number;
  averagePerAppointment: number;
}

interface PaymentRecord {
  id: string;
  appointment_id: string;
  amount: number;
  travel_reimbursement: number;
  total: number;
  appointment_date: string;
  senior_name: string;
  duration_minutes: number;
  status: string;
}

export default function SpecialistEarningsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [earnings, setEarnings] = useState<EarningsData>({
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
    travelReimbursement: 0,
    totalTravelReimbursement: 0,
    completedAppointments: 0,
    thisMonthAppointments: 0,
    averagePerAppointment: 0,
  });
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "thisMonth" | "lastMonth">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && user.role !== "specialist") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "specialist" && user.id) {
      fetchEarnings();
    }
  }, [user, filter]);

  const fetchEarnings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all completed appointments
      const { data: completedApps, error: appsError } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          completed_at,
          duration_minutes,
          specialist_pay_rate,
          specialist_travel_reimbursement,
          senior_id,
          senior:senior_id(full_name)
        `)
        .eq("specialist_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (appsError) {
        console.error("Error fetching appointments:", appsError);
        setIsLoading(false);
        return;
      }

      if (!completedApps || completedApps.length === 0) {
        setEarnings({
          thisMonth: 0,
          lastMonth: 0,
          total: 0,
          travelReimbursement: 0,
          totalTravelReimbursement: 0,
          completedAppointments: 0,
          thisMonthAppointments: 0,
          averagePerAppointment: 0,
        });
        setPayments([]);
        setIsLoading(false);
        return;
      }

      // Calculate earnings
      let thisMonthEarnings = 0;
      let lastMonthEarnings = 0;
      let totalEarnings = 0;
      let thisMonthTravel = 0;
      let lastMonthTravel = 0;
      let totalTravel = 0;
      let thisMonthCount = 0;
      let lastMonthCount = 0;

      const paymentRecords: PaymentRecord[] = [];

      completedApps.forEach((apt: any) => {
        const hours = (apt.duration_minutes || 0) / 60;
        const pay = hours * (apt.specialist_pay_rate || 30);
        const travel = apt.specialist_travel_reimbursement || 0;
        const total = pay + travel;

        totalEarnings += pay;
        totalTravel += travel;

        const completedDate = apt.completed_at ? new Date(apt.completed_at) : new Date(apt.scheduled_at);

        if (completedDate >= startOfMonth) {
          thisMonthEarnings += pay;
          thisMonthTravel += travel;
          thisMonthCount++;
        } else if (completedDate >= startOfLastMonth && completedDate < endOfLastMonth) {
          lastMonthEarnings += pay;
          lastMonthTravel += travel;
          lastMonthCount++;
        }

        paymentRecords.push({
          id: apt.id,
          appointment_id: apt.id,
          amount: pay,
          travel_reimbursement: travel,
          total: total,
          appointment_date: apt.completed_at || apt.scheduled_at,
          senior_name: apt.senior?.full_name || "Unknown",
          duration_minutes: apt.duration_minutes || 0,
          status: "completed",
        });
      });

      // Filter payments based on selected filter
      let filteredPayments = paymentRecords;
      if (filter === "thisMonth") {
        filteredPayments = paymentRecords.filter((p) => {
          const date = new Date(p.appointment_date);
          return date >= startOfMonth;
        });
      } else if (filter === "lastMonth") {
        filteredPayments = paymentRecords.filter((p) => {
          const date = new Date(p.appointment_date);
          return date >= startOfLastMonth && date < endOfLastMonth;
        });
      }

      setEarnings({
        thisMonth: thisMonthEarnings + thisMonthTravel,
        lastMonth: lastMonthEarnings + lastMonthTravel,
        total: totalEarnings + totalTravel,
        travelReimbursement: thisMonthTravel,
        totalTravelReimbursement: totalTravel,
        completedAppointments: completedApps.length,
        thisMonthAppointments: thisMonthCount,
        averagePerAppointment: completedApps.length > 0 
          ? (totalEarnings + totalTravel) / completedApps.length 
          : 0,
      });

      setPayments(filteredPayments);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/specialist/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Earnings & Payments
          </h1>
          <p className="text-xl text-text-secondary">
            View your earnings history and payment details
          </p>
        </motion.div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">This Month</h3>
              <Calendar className="text-primary-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary-500">
              ${earnings.thisMonth.toFixed(2)}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              {earnings.thisMonthAppointments} appointments
            </p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Last Month</h3>
              <TrendingUp className="text-accent-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-accent-400">
              ${earnings.lastMonth.toFixed(2)}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              {earnings.lastMonth === 0 ? "No data" : "Previous period"}
            </p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Total Earnings</h3>
              <DollarSign className="text-success-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-success-500">
              ${earnings.total.toFixed(2)}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              {earnings.completedAppointments} total appointments
            </p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Travel Reimbursement</h3>
              <MapPin className="text-warning-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-warning-500">
              ${earnings.totalTravelReimbursement.toFixed(2)}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              Total reimbursed
            </p>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div variants={slideUp} className="card bg-white p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Average per Appointment</span>
                <span className="font-semibold text-text-primary">
                  ${earnings.averagePerAppointment.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Completed Appointments</span>
                <span className="font-semibold text-text-primary">
                  {earnings.completedAppointments}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Service Earnings</span>
                <span className="font-semibold text-text-primary">
                  ${(earnings.total - earnings.totalTravelReimbursement).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Travel Reimbursement</span>
                <span className="font-semibold text-text-primary">
                  ${earnings.totalTravelReimbursement.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment History */}
        <motion.div variants={slideUp} className="card bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              Payment History
            </h2>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="input"
              >
                <option value="all">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
              <Button variant="outline" size="sm">
                <Download size={18} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">
                No payment records found
              </p>
              <p className="text-sm text-text-tertiary">
                Completed appointments will appear here once they're finished.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                      Duration
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                      Service Pay
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                      Travel
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {new Date(payment.appointment_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-primary">
                        {payment.senior_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {payment.duration_minutes} min
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-text-primary">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-text-primary">
                        ${payment.travel_reimbursement.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-primary-500">
                        ${payment.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

