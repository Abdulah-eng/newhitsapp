"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { FileText, ArrowLeft, Search, AlertCircle, Star, User, Calendar, MessageSquare, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Dispute {
  id: string;
  type: "review" | "cancellation";
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  senior: {
    full_name: string;
    email: string;
  };
  specialist: {
    full_name: string;
    email: string;
  };
  review?: {
    rating: number;
    comment: string;
  };
  appointment?: {
    id: string;
    scheduled_at: string;
    cancellation_reason: string;
  };
}

export default function AdminDisputesPage() {
  const supabase = createSupabaseBrowserClient();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    let filtered = [...disputes];

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((d) => d.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.senior?.full_name?.toLowerCase().includes(query) ||
          d.specialist?.full_name?.toLowerCase().includes(query) ||
          d.senior?.email?.toLowerCase().includes(query) ||
          d.specialist?.email?.toLowerCase().includes(query) ||
          d.review?.comment?.toLowerCase().includes(query) ||
          d.appointment?.cancellation_reason?.toLowerCase().includes(query)
      );
    }

    setFilteredDisputes(filtered);
  }, [disputes, statusFilter, typeFilter, searchQuery]);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      // Fetch low-rated reviews (1-2 stars) as potential disputes
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .lte("rating", 2)
        .order("created_at", { ascending: false });

      // Fetch cancelled appointments with cancellation reasons
      const { data: cancelledAppointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("status", "cancelled")
        .not("cancellation_reason", "is", null)
        .order("cancelled_at", { ascending: false });

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
      }
      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
      }

      // Combine user IDs
      const userIds = new Set<string>();
      if (reviewsData) {
        reviewsData.forEach((r) => {
          userIds.add(r.senior_id);
          userIds.add(r.specialist_id);
        });
      }
      if (cancelledAppointments) {
        cancelledAppointments.forEach((a) => {
          userIds.add(a.senior_id);
          userIds.add(a.specialist_id);
        });
      }

      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", Array.from(userIds));

      if (usersError) {
        console.error("Error fetching users:", usersError);
      }

      // Create disputes from reviews
      const reviewDisputes: Dispute[] =
        reviewsData?.map((review) => {
          const senior = usersData?.find((u) => u.id === review.senior_id);
          const specialist = usersData?.find((u) => u.id === review.specialist_id);
          return {
            id: `review-${review.id}`,
            type: "review" as const,
            status: "open" as const, // You can add a resolved field to reviews table later
            created_at: review.created_at,
            senior: {
              full_name: senior?.full_name || "Unknown",
              email: senior?.email || "N/A",
            },
            specialist: {
              full_name: specialist?.full_name || "Unknown",
              email: specialist?.email || "N/A",
            },
            review: {
              rating: review.rating,
              comment: review.comment || "",
            },
          };
        }) || [];

      // Create disputes from cancelled appointments
      const appointmentDisputes: Dispute[] =
        cancelledAppointments?.map((appointment) => {
          const senior = usersData?.find((u) => u.id === appointment.senior_id);
          const specialist = usersData?.find((u) => u.id === appointment.specialist_id);
          return {
            id: `appointment-${appointment.id}`,
            type: "cancellation" as const,
            status: "open" as const,
            created_at: appointment.cancelled_at || appointment.created_at,
            senior: {
              full_name: senior?.full_name || "Unknown",
              email: senior?.email || "N/A",
            },
            specialist: {
              full_name: specialist?.full_name || "Unknown",
              email: specialist?.email || "N/A",
            },
            appointment: {
              id: appointment.id,
              scheduled_at: appointment.scheduled_at,
              cancellation_reason: appointment.cancellation_reason || "",
            },
          };
        }) || [];

      // Combine and sort by date
      const allDisputes = [...reviewDisputes, ...appointmentDisputes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setDisputes(allDisputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (disputeId: string) => {
    // Mark dispute as resolved
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: "resolved" as const } : d))
    );
  };

  const handleDismiss = async (disputeId: string) => {
    // Mark dispute as dismissed
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: "dismissed" as const } : d))
    );
  };

  const getStatusCounts = () => {
    return {
      all: disputes.length,
      open: disputes.filter((d) => d.status === "open").length,
      resolved: disputes.filter((d) => d.status === "resolved").length,
      dismissed: disputes.filter((d) => d.status === "dismissed").length,
    };
  };

  const statusCounts = getStatusCounts();

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
            Dispute Resolution
          </h1>
          <p className="text-xl text-text-secondary">
            Review and resolve client complaints
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "All", value: statusCounts.all, status: "all" },
            { label: "Open", value: statusCounts.open, status: "open" },
            { label: "Resolved", value: statusCounts.resolved, status: "resolved" },
            { label: "Dismissed", value: statusCounts.dismissed, status: "dismissed" },
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
                  placeholder="Search by name, email, or dispute content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Types</option>
                <option value="review">Low Rating Reviews</option>
                <option value="cancellation">Cancellations</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Disputes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading disputes...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No disputes found</p>
            <p className="text-text-tertiary">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "No disputes have been reported yet"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredDisputes.map((dispute) => (
              <motion.div
                key={dispute.id}
                variants={staggerItem}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            dispute.type === "review"
                              ? "bg-warning-50 text-warning-600"
                              : "bg-error-50 text-error-600"
                          }`}
                        >
                          {dispute.type === "review" ? (
                            <Star size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-text-primary">
                            {dispute.type === "review" ? "Low Rating Review" : "Appointment Cancellation"}
                          </h3>
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border mt-2 ${
                              dispute.status === "open"
                                ? "bg-warning-50 text-warning-700 border-warning-200"
                                : dispute.status === "resolved"
                                ? "bg-success-50 text-success-700 border-success-200"
                                : "bg-secondary-100 text-text-secondary border-secondary-200"
                            }`}
                          >
                            {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Senior</p>
                        <p className="font-semibold text-text-primary">{dispute.senior.full_name}</p>
                        <p className="text-xs text-text-tertiary">{dispute.senior.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-text-secondary mb-1">Specialist</p>
                        <p className="font-semibold text-text-primary">{dispute.specialist.full_name}</p>
                        <p className="text-xs text-text-tertiary">{dispute.specialist.email}</p>
                      </div>

                      {dispute.appointment && (
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Scheduled Date</p>
                          <p className="font-semibold text-text-primary">
                            {new Date(dispute.appointment.scheduled_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-text-secondary mb-1">Reported</p>
                        <p className="font-semibold text-text-primary">
                          {new Date(dispute.created_at).toLocaleDateString("en-US")}
                        </p>
                      </div>
                    </div>

                    {dispute.review && (
                      <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="text-warning-600" size={18} />
                          <p className="text-sm font-medium text-warning-700">
                            Rating: {dispute.review.rating}/5
                          </p>
                        </div>
                        <p className="text-sm text-warning-800">{dispute.review.comment}</p>
                      </div>
                    )}

                    {dispute.appointment && dispute.appointment.cancellation_reason && (
                      <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                        <p className="text-sm font-medium text-error-700 mb-2">Cancellation Reason</p>
                        <p className="text-sm text-error-800">{dispute.appointment.cancellation_reason}</p>
                      </div>
                    )}
                  </div>

                  {dispute.status === "open" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolve(dispute.id)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(dispute.id)}
                        className="text-error-500 border-error-500 hover:bg-error-50"
                      >
                        <X size={16} className="mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
