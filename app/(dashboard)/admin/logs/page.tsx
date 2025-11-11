"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { FileText, ArrowLeft, Search, Filter, Calendar, User, DollarSign, MessageSquare, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LogEntry {
  id: string;
  type: "user_registration" | "appointment_created" | "appointment_completed" | "payment_processed" | "message_sent" | "review_submitted";
  description: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
  metadata?: any;
  created_at: string;
}

export default function AdminLogsPage() {
  const supabase = createSupabaseBrowserClient();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    if (typeFilter !== "all") {
      filtered = filtered.filter((log) => log.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.description?.toLowerCase().includes(query) ||
          log.user?.full_name?.toLowerCase().includes(query) ||
          log.user?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, typeFilter, searchQuery]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const logEntries: LogEntry[] = [];

      // Fetch recent user registrations
      const { data: recentUsers, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!usersError && recentUsers) {
        recentUsers.forEach((user) => {
          logEntries.push({
            id: `user-${user.id}`,
            type: "user_registration",
            description: `New ${user.role} registered: ${user.full_name}`,
            user: {
              full_name: user.full_name,
              email: user.email,
              role: user.role,
            },
            created_at: user.created_at,
          });
        });
      }

      // Fetch recent appointments
      const { data: recentAppointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, senior_id, specialist_id, status, created_at, completed_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!appointmentsError && recentAppointments) {
        const userIds = new Set<string>();
        recentAppointments.forEach((apt) => {
          userIds.add(apt.senior_id);
          userIds.add(apt.specialist_id);
        });

        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name, email, role")
          .in("id", Array.from(userIds));

        recentAppointments.forEach((apt) => {
          const senior = usersData?.find((u) => u.id === apt.senior_id);
          const specialist = usersData?.find((u) => u.id === apt.specialist_id);

          logEntries.push({
            id: `appointment-${apt.id}`,
            type: "appointment_created",
            description: `Appointment created between ${senior?.full_name || "Senior"} and ${specialist?.full_name || "Specialist"}`,
            user: senior
              ? {
                  full_name: senior.full_name,
                  email: senior.email,
                  role: senior.role,
                }
              : undefined,
            metadata: { appointment_id: apt.id, status: apt.status },
            created_at: apt.created_at,
          });

          if (apt.status === "completed" && apt.completed_at) {
            logEntries.push({
              id: `appointment-completed-${apt.id}`,
              type: "appointment_completed",
              description: `Appointment completed between ${senior?.full_name || "Senior"} and ${specialist?.full_name || "Specialist"}`,
              user: senior
                ? {
                    full_name: senior.full_name,
                    email: senior.email,
                    role: senior.role,
                  }
                : undefined,
              metadata: { appointment_id: apt.id },
              created_at: apt.completed_at,
            });
          }
        });
      }

      // Fetch recent payments
      const { data: recentPayments, error: paymentsError } = await supabase
        .from("payments")
        .select("id, senior_id, specialist_id, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!paymentsError && recentPayments) {
        const userIds = new Set<string>();
        recentPayments.forEach((p) => {
          userIds.add(p.senior_id);
          userIds.add(p.specialist_id);
        });

        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name, email, role")
          .in("id", Array.from(userIds));

        recentPayments.forEach((payment) => {
          const senior = usersData?.find((u) => u.id === payment.senior_id);
          logEntries.push({
            id: `payment-${payment.id}`,
            type: "payment_processed",
            description: `Payment of $${Number(payment.amount).toFixed(2)} processed - Status: ${payment.status}`,
            user: senior
              ? {
                  full_name: senior.full_name,
                  email: senior.email,
                  role: senior.role,
                }
              : undefined,
            metadata: { payment_id: payment.id, amount: payment.amount, status: payment.status },
            created_at: payment.created_at,
          });
        });
      }

      // Fetch recent reviews
      const { data: recentReviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("id, senior_id, specialist_id, rating, created_at")
        .order("created_at", { ascending: false })
        .limit(15);

      if (!reviewsError && recentReviews) {
        const userIds = new Set<string>();
        recentReviews.forEach((r) => {
          userIds.add(r.senior_id);
          userIds.add(r.specialist_id);
        });

        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name, email, role")
          .in("id", Array.from(userIds));

        recentReviews.forEach((review) => {
          const senior = usersData?.find((u) => u.id === review.senior_id);
          logEntries.push({
            id: `review-${review.id}`,
            type: "review_submitted",
            description: `Review submitted: ${review.rating} stars`,
            user: senior
              ? {
                  full_name: senior.full_name,
                  email: senior.email,
                  role: senior.role,
                }
              : undefined,
            metadata: { review_id: review.id, rating: review.rating },
            created_at: review.created_at,
          });
        });
      }

      // Sort by date
      logEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(logEntries);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <User size={20} className="text-primary-500" />;
      case "appointment_created":
      case "appointment_completed":
        return <Calendar size={20} className="text-accent-400" />;
      case "payment_processed":
        return <DollarSign size={20} className="text-success-500" />;
      case "message_sent":
        return <MessageSquare size={20} className="text-primary-500" />;
      case "review_submitted":
        return <CheckCircle size={20} className="text-warning-500" />;
      default:
        return <FileText size={20} className="text-text-secondary" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "user_registration":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "appointment_created":
      case "appointment_completed":
        return "bg-accent-50 text-accent-700 border-accent-200";
      case "payment_processed":
        return "bg-success-50 text-success-700 border-success-200";
      case "message_sent":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "review_submitted":
        return "bg-warning-50 text-warning-700 border-warning-200";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
    }
  };

  const getTypeCounts = () => {
    return {
      all: logs.length,
      user_registration: logs.filter((l) => l.type === "user_registration").length,
      appointment_created: logs.filter((l) => l.type === "appointment_created").length,
      appointment_completed: logs.filter((l) => l.type === "appointment_completed").length,
      payment_processed: logs.filter((l) => l.type === "payment_processed").length,
      review_submitted: logs.filter((l) => l.type === "review_submitted").length,
    };
  };

  const typeCounts = getTypeCounts();

  return (
    <div>
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
            Activity Logs
          </h1>
          <p className="text-xl text-text-secondary">
            View platform activity and audit trail
          </p>
        </motion.div>

        {/* Type Filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: "All", value: typeCounts.all, type: "all" },
            { label: "Registrations", value: typeCounts.user_registration, type: "user_registration" },
            { label: "Appointments", value: typeCounts.appointment_created, type: "appointment_created" },
            { label: "Completed", value: typeCounts.appointment_completed, type: "appointment_completed" },
            { label: "Payments", value: typeCounts.payment_processed, type: "payment_processed" },
            { label: "Reviews", value: typeCounts.review_submitted, type: "review_submitted" },
          ].map((stat) => (
            <motion.div
              key={stat.type}
              variants={slideUp}
              className={`card bg-white p-4 cursor-pointer transition-all ${
                typeFilter === stat.type ? "ring-2 ring-primary-500" : ""
              }`}
              onClick={() => setTypeFilter(stat.type)}
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
                  placeholder="Search logs by description, user name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-text-secondary" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Types</option>
                <option value="user_registration">User Registrations</option>
                <option value="appointment_created">Appointments Created</option>
                <option value="appointment_completed">Appointments Completed</option>
                <option value="payment_processed">Payments Processed</option>
                <option value="review_submitted">Reviews Submitted</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Logs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No logs found</p>
            <p className="text-text-tertiary">
              {searchQuery || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "No activity logs available"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                variants={staggerItem}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg border ${getLogColor(log.type)}`}
                  >
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-1">
                          {log.description}
                        </h3>
                        {log.user && (
                          <p className="text-sm text-text-secondary">
                            User: {log.user.full_name} ({log.user.email}) - {log.user.role}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-text-tertiary whitespace-nowrap ml-4">
                        {new Date(log.created_at).toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getLogColor(
                          log.type
                        )}`}
                      >
                        {log.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
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

