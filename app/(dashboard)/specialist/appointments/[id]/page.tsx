"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, ArrowLeft, CheckCircle, X, MessageSquare, Save } from "lucide-react";

function SpecialistAppointmentDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [appointment, setAppointment] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!authLoading && user?.id && params.id) {
      fetchAppointment();
    }
  }, [user, authLoading, params.id]);

  const fetchAppointment = async () => {
    setIsLoading(true);
    
    const appointmentId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!appointmentId) {
      router.push("/specialist/appointments");
      setIsLoading(false);
      return;
    }
    
    // Fetch appointment
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      console.error("Error fetching appointment:", appointmentError);
      router.push("/specialist/appointments");
      setIsLoading(false);
      return;
    }

    if (appointmentData.specialist_id !== user?.id) {
      router.push("/specialist/appointments");
      setIsLoading(false);
      return;
    }

    // Fetch senior user details
    const { data: seniorData, error: seniorError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", appointmentData.senior_id)
      .single();

    if (seniorError) {
      console.error("Error fetching senior details:", seniorError);
    }

    // Fetch payment status
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .eq("status", "completed")
      .maybeSingle();

    if (paymentError) {
      console.error("Error fetching payment:", paymentError);
    }

    // Combine appointment with senior data
    const appointmentWithSenior = {
      ...appointmentData,
      senior: {
        full_name: seniorData?.full_name || "Unknown",
        user_id: seniorData?.id || appointmentData.senior_id
      },
      specialist: {
        full_name: user?.user_metadata?.full_name || "You"
      }
    };

    setAppointment(appointmentWithSenior);
    setPayment(paymentData || null);
    setNotes(appointmentData.notes || "");
    setIsLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    // If starting appointment, verify payment is completed
    if (newStatus === "in-progress" && !payment) {
      alert("Cannot start appointment. Payment has not been completed yet.");
      return;
    }

    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else if (newStatus === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
    }

    const appointmentId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!appointmentId) return;
    
    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (error) {
      alert("Failed to update appointment. Please try again.");
      return;
    }

    fetchAppointment();
  };

  const saveNotes = async () => {
    setIsSaving(true);
    const appointmentId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!appointmentId) {
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({ notes })
      .eq("id", appointmentId);

    if (error) {
      alert("Failed to save notes. Please try again.");
    } else {
      alert("Notes saved successfully!");
      // Refresh appointment data to show updated notes
      fetchAppointment();
    }
    setIsSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success-50 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "in-progress":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "completed":
        return "bg-secondary-200 text-text-primary border-secondary-300";
      case "cancelled":
        return "bg-error-50 text-error-700 border-error-200";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/specialist/appointments"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Appointments
        </Link>

        <motion.div variants={slideUp} className="card bg-white p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Appointment Details
              </h1>
              <span
                className={`inline-block px-4 py-2 rounded-lg font-medium border ${getStatusColor(
                  appointment.status
                )}`}
              >
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1).replace("-", " ")}
              </span>
            </div>
            <div className="flex gap-2">
              {appointment.status === "pending" && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => updateStatus("confirmed")}
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to cancel this appointment?")) {
                        updateStatus("cancelled");
                      }
                    }}
                    className="text-error-500 border-error-500 hover:bg-error-50"
                  >
                    <X size={18} className="mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {appointment.status === "confirmed" && (
                <>
                  {payment ? (
                    <Button
                      variant="primary"
                      onClick={() => updateStatus("in-progress")}
                    >
                      Start Appointment
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-warning-50 border border-warning-200 rounded-lg">
                      <Clock size={18} className="text-warning-600" />
                      <span className="text-sm font-medium text-warning-700">Waiting for Payment</span>
                    </div>
                  )}
                </>
              )}
              {appointment.status === "in-progress" && (
                <Button
                  variant="primary"
                  onClick={() => updateStatus("completed")}
                >
                  Complete Appointment
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <User size={18} />
                  <span className="text-sm font-medium">Client</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {appointment.senior?.full_name}
                </p>
              </div>

              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">Date & Time</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {new Date(appointment.scheduled_at).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <Clock size={18} />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {appointment.duration_minutes} minutes
                </p>
              </div>

              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <MapPin size={18} />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {appointment.location_type === "remote"
                    ? "Remote (Video Call)"
                    : appointment.address || "Address not provided"}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">Issue Description</h2>
              <p className="text-text-secondary whitespace-pre-line bg-secondary-50 p-4 rounded-lg">
                {appointment.issue_description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">Notes</h2>
              <textarea
                className="input min-h-[120px] resize-y w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this appointment..."
                rows={5}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveNotes}
                  isLoading={isSaving}
                >
                  <Save size={16} className="mr-2" />
                  Save Notes
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              {appointment.senior?.user_id && (
                <Link href={`/specialist/messages/${appointment.senior.user_id}`}>
                  <Button variant="primary">
                    <MessageSquare size={18} className="mr-2" />
                    Message Client
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SpecialistAppointmentDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <SpecialistAppointmentDetailPageContent />
    </Suspense>
  );
}

