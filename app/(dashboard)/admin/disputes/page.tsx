 "use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { FileText, ArrowLeft, Search, AlertCircle, Star, XCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type DisputeType = "review" | "cancellation" | "payment" | "service" | "other";
type DisputeStatus = "open" | "resolved" | "dismissed";

interface PersonSummary {
  full_name: string;
  email: string;
}

interface AppointmentSummary {
  id: string;
  scheduled_at?: string;
  cancellation_reason?: string;
  issue_description?: string;
}

interface PaymentSummary {
  id: string;
  amount: number;
  status: string;
  stripe_payment_id?: string;
  created_at?: string;
}

interface Dispute {
  id: string;
  type: DisputeType;
  status: DisputeStatus;
  created_at: string;
  reason: string;
  description?: string;
  resolution?: string;
  resolution_notes?: string;
  refund_amount?: number;
  credit_amount?: number;
  senior: PersonSummary;
  specialist?: PersonSummary;
  appointment?: AppointmentSummary;
  payment?: PaymentSummary;
  review?: {
    rating: number;
    comment: string;
  };
}

export default function AdminDisputesPage() {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailForm, setDetailForm] = useState({
    status: "open" as DisputeStatus,
    resolution: "",
    notes: "",
  });
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const [detailSaving, setDetailSaving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    if (selectedDispute) {
      setDetailForm({
        status: selectedDispute.status,
        resolution: selectedDispute.resolution || "",
        notes: selectedDispute.resolution_notes || "",
      });
      setDetailMessage(null);
    }
  }, [selectedDispute]);

  const filteredDisputes = useMemo(() => {
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
          d.senior?.email?.toLowerCase().includes(query) ||
          d.specialist?.full_name?.toLowerCase().includes(query) ||
          d.specialist?.email?.toLowerCase().includes(query) ||
          d.review?.comment?.toLowerCase().includes(query) ||
          d.appointment?.cancellation_reason?.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query) ||
          d.reason?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [disputes, statusFilter, typeFilter, searchQuery]);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      // Fetch disputes from the disputes table
      const { data: disputesData, error: disputesError } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });

      if (disputesError) {
        console.error("Error fetching disputes:", disputesError);
        setDisputes([]);
        setIsLoading(false);
        return;
      }

      if (!disputesData || disputesData.length === 0) {
        console.log("No disputes found");
        setDisputes([]);
        setIsLoading(false);
        return;
      }

      const userIds = new Set<string>();
      const reviewIds = new Set<string>();
      const paymentIds = new Set<string>();
      const appointmentIds = new Set<string>();

      disputesData.forEach((d) => {
        if (d.senior_id) userIds.add(d.senior_id);
        if (d.specialist_id) userIds.add(d.specialist_id);
        if (d.review_id) reviewIds.add(d.review_id);
        if (d.payment_id) paymentIds.add(d.payment_id);
        if (d.appointment_id) appointmentIds.add(d.appointment_id);
      });

      // Fetch user details
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", Array.from(userIds));

      if (usersError) {
        console.error("Error fetching users:", usersError);
      }

      // Fetch payments first so we can pull additional appointment IDs
      let paymentsData: any[] = [];
      if (paymentIds.size > 0) {
        const { data: payData, error: payError } = await supabase
          .from("payments")
          .select("id, amount, status, stripe_payment_id, appointment_id, created_at")
          .in("id", Array.from(paymentIds));

        if (payError) {
          console.error("Error fetching payments:", payError);
        } else {
          paymentsData = payData || [];
          paymentsData.forEach((payment) => {
            if (payment.appointment_id) {
              appointmentIds.add(payment.appointment_id);
            }
          });
        }
      }

      // Fetch appointments (include issue_description)
      let appointmentsData: any[] = [];
      if (appointmentIds.size > 0) {
        const { data: aptData, error: aptError } = await supabase
          .from("appointments")
          .select("id, scheduled_at, cancellation_reason, issue_description")
          .in("id", Array.from(appointmentIds));

        if (aptError) {
          console.error("Error fetching appointments:", aptError);
        } else {
          appointmentsData = aptData || [];
        }
      }

      // Fetch reviews
      let reviewsData: any[] = [];
      if (reviewIds.size > 0) {
        const { data: revData, error: revError } = await supabase
          .from("reviews")
          .select("id, rating, comment")
          .in("id", Array.from(reviewIds));

        if (revError) {
          console.error("Error fetching reviews:", revError);
        } else {
          reviewsData = revData || [];
        }
      }

      const usersMap = Object.fromEntries((usersData || []).map((u) => [u.id, u]));
      const appointmentsMap = Object.fromEntries(appointmentsData.map((a) => [a.id, a]));
      const paymentsMap = Object.fromEntries(paymentsData.map((p) => [p.id, p]));
      const reviewsMap = Object.fromEntries(reviewsData.map((r) => [r.id, r]));

      const mappedDisputes: Dispute[] = disputesData.map((dispute) => {
        const senior = usersMap[dispute.senior_id];
        const specialist = dispute.specialist_id ? usersMap[dispute.specialist_id] : undefined;
        const payment = dispute.payment_id ? paymentsMap[dispute.payment_id] : undefined;
        const appointmentSourceId = dispute.appointment_id || payment?.appointment_id;
        const appointment = appointmentSourceId ? appointmentsMap[appointmentSourceId] : undefined;
        const review = dispute.review_id ? reviewsMap[dispute.review_id] : undefined;

        return {
          id: dispute.id,
          type: (dispute.type as DisputeType) || "other",
          status: dispute.status as DisputeStatus,
          created_at: dispute.created_at,
          reason: dispute.reason,
          description: dispute.description || "",
          resolution: dispute.resolution || "",
          resolution_notes: dispute.resolution_notes || "",
          refund_amount: dispute.refund_amount || 0,
          credit_amount: dispute.credit_amount || 0,
          senior: {
            full_name: senior?.full_name || "Unknown",
            email: senior?.email || "N/A",
          },
          specialist: specialist
            ? {
                full_name: specialist.full_name || "Unknown",
                email: specialist.email || "N/A",
              }
            : undefined,
          appointment: appointment
            ? {
                id: appointment.id,
                scheduled_at: appointment.scheduled_at,
                cancellation_reason: appointment.cancellation_reason || "",
                issue_description: appointment.issue_description || "",
              }
            : undefined,
          payment: payment
            ? {
                id: payment.id,
                amount: Number(payment.amount) || 0,
                status: payment.status || "pending",
                stripe_payment_id: payment.stripe_payment_id || undefined,
                created_at: payment.created_at || undefined,
              }
            : undefined,
          review: review
            ? {
                rating: review.rating,
                comment: review.comment || "",
              }
            : undefined,
        };
      });

      setDisputes(mappedDisputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      setDisputes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailSave = async () => {
    if (!selectedDispute) return;
    setDetailSaving(true);
    setDetailMessage(null);

    try {
      const updates: Record<string, any> = {
        status: detailForm.status,
        resolution: detailForm.resolution || null,
        resolution_notes: detailForm.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (detailForm.status === "open") {
        updates.resolved_at = null;
        updates.resolved_by = null;
      } else {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id || null;
      }

      const { error } = await supabase.from("disputes").update(updates).eq("id", selectedDispute.id);

      if (error) {
        throw error;
      }

      setDisputes((prev) =>
        prev.map((d) =>
          d.id === selectedDispute.id
            ? {
                ...d,
                status: detailForm.status,
                resolution: detailForm.resolution,
                resolution_notes: detailForm.notes,
              }
            : d
        )
      );

      setSelectedDispute((prev) =>
        prev
          ? {
              ...prev,
              status: detailForm.status,
              resolution: detailForm.resolution,
              resolution_notes: detailForm.notes,
            }
          : prev
      );

      setDetailMessage("Dispute updated successfully.");

      await logActivity(detailForm.status, selectedDispute.id, detailForm.resolution);
    } catch (error: any) {
      setDetailMessage(error.message || "Failed to update dispute.");
    } finally {
      setDetailSaving(false);
    }
  };

  const logActivity = async (status: DisputeStatus, disputeId: string, resolution?: string) => {
    const type =
      status === "resolved"
        ? "dispute_resolved"
        : status === "dismissed"
        ? "dispute_dismissed"
        : "dispute_updated";

    try {
      await fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description: `Dispute ${status}: ${disputeId}`,
          metadata: {
            dispute_id: disputeId,
            resolution,
            status,
          },
        }),
      });
    } catch (error) {
      console.error("Error logging dispute update:", error);
    }
  };

  const statusCounts = useMemo(() => {
    return {
      all: disputes.length,
      open: disputes.filter((d) => d.status === "open").length,
      resolved: disputes.filter((d) => d.status === "resolved").length,
      dismissed: disputes.filter((d) => d.status === "dismissed").length,
    };
  }, [disputes]);

  const closeDetail = () => {
    setSelectedDispute(null);
    setDetailMessage(null);
  };

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
        ) : disputes.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No disputes found</p>
            <p className="text-text-tertiary">No disputes have been reported yet</p>
          </motion.div>
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
          <>
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
                className="card bg-white p-6 hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => setSelectedDispute(dispute)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            dispute.type === "review"
                              ? "bg-warning-50 text-warning-600"
                              : dispute.type === "payment"
                              ? "bg-accent-50 text-accent-600"
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
                            {disputeTypeLabel(dispute.type)}
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

                      {dispute.specialist && (
                        <div>
                          <p className="text-sm text-text-secondary mb-1">Specialist</p>
                          <p className="font-semibold text-text-primary">{dispute.specialist.full_name}</p>
                          <p className="text-xs text-text-tertiary">{dispute.specialist.email}</p>
                        </div>
                      )}

                      {dispute.appointment && dispute.appointment.scheduled_at && (
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

                    {dispute.description && (
                      <div className="mt-4 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
                        <p className="text-sm font-medium text-text-primary mb-2">Issue Description</p>
                        <p className="text-sm text-text-secondary whitespace-pre-line">{dispute.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDispute(dispute); }}>
                      Manage
                    </Button>
                    {dispute.payment && (
                      <div className="text-xs text-text-secondary">
                        Payment ID: {dispute.payment.id.slice(0, 8)}…
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </>
        )}
      </motion.div>

      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          form={detailForm}
          onChange={setDetailForm}
          onClose={closeDetail}
          onSave={handleDetailSave}
          isSaving={detailSaving}
          message={detailMessage}
        />
      )}
    </div>
  );
}

function disputeTypeLabel(type: DisputeType) {
  switch (type) {
    case "review":
      return "Low Rating Review";
    case "cancellation":
      return "Appointment Cancellation";
    case "payment":
      return "Payment / Refund Issue";
    case "service":
      return "Service Quality Issue";
    default:
      return "Other Issue";
  }
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US");
}

type DetailModalProps = {
  dispute: Dispute;
  form: { status: DisputeStatus; resolution: string; notes: string };
  onChange: (form: { status: DisputeStatus; resolution: string; notes: string }) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  message: string | null;
};

function DisputeDetailModal({ dispute, form, onChange, onClose, onSave, isSaving, message }: DetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button className="absolute top-4 right-4 text-text-secondary hover:text-text-primary" onClick={onClose}>
          <XCircle size={22} />
        </button>

        <div className="mb-6">
          <p className="text-sm text-text-secondary mb-1">Dispute ID: {dispute.id}</p>
          <h2 className="text-3xl font-bold text-primary-600 mb-2">{disputeTypeLabel(dispute.type)}</h2>
          <p className="text-sm text-text-secondary">Reported on {formatDateTime(dispute.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DetailCard title="Client" primary={dispute.senior.full_name} secondary={dispute.senior.email} />
          {dispute.specialist && (
            <DetailCard title="Specialist" primary={dispute.specialist.full_name} secondary={dispute.specialist.email} />
          )}
          {dispute.appointment && (
            <DetailCard
              title="Appointment"
              primary={`#${dispute.appointment.id.substring(0, 8)}`}
              secondary={formatDate(dispute.appointment.scheduled_at)}
              tertiary={dispute.appointment.issue_description}
            />
          )}
          {dispute.payment && (
            <DetailCard
              title="Payment"
              primary={`$${dispute.payment.amount.toFixed(2)}`}
              secondary={`Stripe ID: ${dispute.payment.stripe_payment_id || "N/A"}`}
              tertiary={`Status: ${dispute.payment.status}`}
            />
          )}
        </div>

        {dispute.reason && (
          <Section>
            <SectionTitle>Client Summary</SectionTitle>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{dispute.reason}</p>
          </Section>
        )}

        {dispute.description && (
          <Section>
            <SectionTitle>Description</SectionTitle>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{dispute.description}</p>
          </Section>
        )}

        {dispute.review && (
          <Section>
            <SectionTitle>Review Details</SectionTitle>
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-warning-600" size={18} />
              <p className="text-sm font-medium text-warning-700">
                Rating: {dispute.review.rating}/5
              </p>
            </div>
            <p className="text-sm text-warning-800 whitespace-pre-wrap">{dispute.review.comment}</p>
          </Section>
        )}

        {dispute.appointment?.cancellation_reason && (
          <Section>
            <SectionTitle>Cancellation Reason</SectionTitle>
            <p className="text-sm text-error-700 whitespace-pre-wrap">{dispute.appointment.cancellation_reason}</p>
          </Section>
        )}

        <Section>
          <SectionTitle>Resolution</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-tertiary mb-1">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => onChange({ ...form, status: e.target.value as DisputeStatus })}
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-tertiary mb-1">Resolution Summary</label>
              <Input
                placeholder="e.g. Refunded visit fee"
                value={form.resolution}
                onChange={(e) => onChange({ ...form, resolution: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-text-tertiary mb-1">Admin Notes</label>
            <textarea
              className="input min-h-[120px]"
              placeholder="Add internal notes about the investigation or next steps."
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            {message && (
              <p className="text-sm text-primary-600">{message}</p>
            )}
            <div className="flex gap-3 ml-auto">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" onClick={onSave} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function DetailCard({ title, primary, secondary, tertiary }: { title: string; primary: string; secondary?: string; tertiary?: string }) {
  return (
    <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
      <p className="text-xs uppercase text-text-tertiary mb-1">{title}</p>
      <p className="text-lg font-semibold text-text-primary">{primary}</p>
      {secondary && <p className="text-sm text-text-secondary">{secondary}</p>}
      {tertiary && <p className="text-xs text-text-tertiary mt-1 whitespace-pre-wrap">{tertiary}</p>}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-text-primary mb-2">{children}</p>;
}
