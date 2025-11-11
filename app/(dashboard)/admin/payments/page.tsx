"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { DollarSign, ArrowLeft, Search, Filter, CheckCircle, X, AlertCircle, Clock, TrendingUp, Download } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_id: string;
  refund_amount: number;
  refund_reason: string;
  created_at: string;
  updated_at: string;
  senior: {
    full_name: string;
    email: string;
  };
  specialist: {
    full_name: string;
    email: string;
  };
  appointment?: {
    scheduled_at: string;
    status: string;
  };
}

export default function AdminPaymentsPage() {
  const supabase = createSupabaseBrowserClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = [...payments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.senior?.full_name?.toLowerCase().includes(query) ||
          payment.specialist?.full_name?.toLowerCase().includes(query) ||
          payment.senior?.email?.toLowerCase().includes(query) ||
          payment.specialist?.email?.toLowerCase().includes(query) ||
          payment.stripe_payment_id?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  }, [payments, statusFilter, searchQuery]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        setIsLoading(false);
        return;
      }

      if (!paymentsData || paymentsData.length === 0) {
        setPayments([]);
        setIsLoading(false);
        return;
      }

      // Fetch user details and appointments
      const seniorIds = [...new Set(paymentsData.map((p) => p.senior_id))];
      const specialistIds = [...new Set(paymentsData.map((p) => p.specialist_id))];
      const appointmentIds = [...new Set(paymentsData.map((p) => p.appointment_id))];
      const allUserIds = [...new Set([...seniorIds, ...specialistIds])];

      const [usersRes, appointmentsRes] = await Promise.all([
        supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", allUserIds),
        supabase
          .from("appointments")
          .select("id, scheduled_at, status")
          .in("id", appointmentIds),
      ]);

      if (usersRes.error) {
        console.error("Error fetching users:", usersRes.error);
      }
      if (appointmentsRes.error) {
        console.error("Error fetching appointments:", appointmentsRes.error);
      }

      // Combine payments with user and appointment data
      const paymentsWithDetails = paymentsData.map((payment) => {
        const senior = usersRes.data?.find((u) => u.id === payment.senior_id);
        const specialist = usersRes.data?.find((u) => u.id === payment.specialist_id);
        const appointment = appointmentsRes.data?.find((a) => a.id === payment.appointment_id);
        return {
          ...payment,
          senior: {
            full_name: senior?.full_name || "Unknown",
            email: senior?.email || "N/A",
          },
          specialist: {
            full_name: specialist?.full_name || "Unknown",
            email: specialist?.email || "N/A",
          },
          appointment: appointment || undefined,
        };
      });

      setPayments(paymentsWithDetails as Payment[]);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-50 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "refunded":
        return "bg-error-50 text-error-700 border-error-200";
      case "failed":
        return "bg-error-50 text-error-700 border-error-200";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
    }
  };

  const getStats = () => {
    const completed = payments.filter((p) => p.status === "completed");
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRefunds = payments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + Number(p.refund_amount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds;

    return {
      total: payments.length,
      completed: completed.length,
      pending: payments.filter((p) => p.status === "pending").length,
      refunded: payments.filter((p) => p.status === "refunded").length,
      failed: payments.filter((p) => p.status === "failed").length,
      totalRevenue,
      totalRefunds,
      netRevenue,
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Payments Management
          </h1>
          <p className="text-xl text-text-secondary">
            Monitor transactions and process refunds
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <TrendingUp className="text-success-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-success-500">${stats.totalRevenue.toFixed(2)}</p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Net Revenue</p>
              <DollarSign className="text-primary-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary-500">${stats.netRevenue.toFixed(2)}</p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Total Refunds</p>
              <X className="text-error-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-error-500">${stats.totalRefunds.toFixed(2)}</p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Total Transactions</p>
              <DollarSign className="text-accent-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-accent-400">{stats.total}</p>
          </motion.div>
        </div>

        {/* Status Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "All", value: stats.total, status: "all" },
            { label: "Completed", value: stats.completed, status: "completed" },
            { label: "Pending", value: stats.pending, status: "pending" },
            { label: "Refunded", value: stats.refunded, status: "refunded" },
            { label: "Failed", value: stats.failed, status: "failed" },
          ].map((stat) => (
            <motion.div
              key={stat.status}
              variants={slideUp}
              className={`card bg-white p-4 cursor-pointer transition-all ${
                statusFilter === stat.status ? "ring-2 ring-primary-500" : ""
              }`}
              onClick={() => setStatusFilter(stat.status)}
            >
              <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-primary-500">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                <Input
                  type="text"
                  placeholder="Search by name, email, or payment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-text-secondary" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Payments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <DollarSign size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No payments found</p>
            <p className="text-text-tertiary">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No payments have been processed yet"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredPayments.map((payment) => (
              <motion.div
                key={payment.id}
                variants={staggerItem}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                          Payment #{payment.id.substring(0, 8)}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-500">
                          ${Number(payment.amount).toFixed(2)}
                        </p>
                        {payment.refund_amount > 0 && (
                          <p className="text-sm text-error-500 mt-1">
                            Refunded: ${Number(payment.refund_amount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Senior</p>
                        <p className="font-semibold text-text-primary">{payment.senior.full_name}</p>
                        <p className="text-xs text-text-tertiary">{payment.senior.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-text-secondary mb-1">Specialist</p>
                        <p className="font-semibold text-text-primary">{payment.specialist.full_name}</p>
                        <p className="text-xs text-text-tertiary">{payment.specialist.email}</p>
                      </div>

                      {payment.appointment && (
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Appointment Date</p>
                          <p className="font-semibold text-text-primary">
                            {new Date(payment.appointment.scheduled_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-text-secondary mb-1">Payment Method</p>
                        <p className="font-semibold text-text-primary">
                          {payment.payment_method || "Stripe"}
                        </p>
                      </div>

                      {payment.stripe_payment_id && (
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Stripe Payment ID</p>
                          <p className="font-semibold text-text-primary text-xs">
                            {payment.stripe_payment_id}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-text-secondary mb-1">Created</p>
                        <p className="font-semibold text-text-primary">
                          {new Date(payment.created_at).toLocaleString("en-US")}
                        </p>
                      </div>
                    </div>

                    {payment.refund_reason && (
                      <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                        <p className="text-sm font-medium text-error-700 mb-1">Refund Reason</p>
                        <p className="text-sm text-error-600">{payment.refund_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
