"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { DollarSign, Calendar, User, Search, Download, CheckCircle, X, Clock, ArrowLeft } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  refund_amount: number;
  refunded_at: string | null;
  appointment: {
    id: string;
    scheduled_at: string;
    specialist: {
      full_name: string;
    };
  };
}

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchPayments();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterPayments();
  }, [payments, statusFilter, searchQuery]);

  const fetchPayments = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("payments")
      .select("*, appointment:appointment_id(id, scheduled_at, specialist:specialist_id(full_name))")
      .eq("senior_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      return;
    }

    setPayments((data as Payment[]) || []);
    setIsLoading(false);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.appointment?.specialist?.full_name?.toLowerCase().includes(query) ||
          payment.id.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-50 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "refunded":
        return "bg-secondary-200 text-text-primary border-secondary-300";
      case "failed":
        return "bg-error-50 text-error-700 border-error-200";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
    }
  };

  const downloadInvoice = async (paymentId: string) => {
    // Generate and download invoice
    window.open(`/api/payments/invoice/${paymentId}`, "_blank");
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
          href="/senior/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Payment History
          </h1>
          <p className="text-xl text-text-secondary">
            View and manage your payments
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={slideUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Total Paid</h3>
              <DollarSign className="text-success-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-text-primary">
              $
              {payments
                .filter((p) => p.status === "completed")
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
          </div>

          <div className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Pending</h3>
              <Clock className="text-warning-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-text-primary">
              {payments.filter((p) => p.status === "pending").length}
            </p>
          </div>

          <div className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Refunded</h3>
              <X className="text-text-tertiary" size={24} />
            </div>
            <p className="text-3xl font-bold text-text-primary">
              $
              {payments
                .filter((p) => p.status === "refunded")
                .reduce((sum, p) => sum + (p.refund_amount || 0), 0)
                .toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payments..."
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </motion.div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <DollarSign className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary">
              {payments.length === 0
                ? "No payments yet"
                : "No payments match your filters"}
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
                whileHover={{ y: -2 }}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          {payment.appointment?.specialist?.full_name || "Specialist"}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-500">
                          ${payment.amount.toFixed(2)}
                        </p>
                        {payment.refund_amount > 0 && (
                          <p className="text-sm text-text-tertiary">
                            Refunded: ${payment.refund_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-text-secondary text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          {payment.appointment?.scheduled_at
                            ? new Date(
                                payment.appointment.scheduled_at
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>
                          Paid on{" "}
                          {new Date(payment.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {payment.payment_method && (
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {payment.payment_method}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {payment.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(payment.id)}
                      >
                        <Download size={16} className="mr-2" />
                        Invoice
                      </Button>
                    )}
                    {payment.appointment?.id && (
                      <Link href={`/senior/my-appointments/${payment.appointment.id}`}>
                        <Button variant="ghost" size="sm" className="w-full">
                          View Appointment
                        </Button>
                      </Link>
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

