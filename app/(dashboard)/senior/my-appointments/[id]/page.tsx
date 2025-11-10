"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, ArrowLeft, CheckCircle, X, MessageSquare, DollarSign, Star } from "lucide-react";

function AppointmentDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const success = searchParams.get("success");

  useEffect(() => {
    if (!authLoading && user?.id && params.id) {
      fetchAppointment();
    }
  }, [user, authLoading, params.id]);

  const fetchAppointment = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, specialist:specialist_id(full_name, user_id), senior:senior_id(full_name)")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching appointment:", error);
      router.push("/senior/my-appointments");
      return;
    }

    if (data.senior_id !== user?.id) {
      router.push("/senior/my-appointments");
      return;
    }

    setAppointment(data);
    setIsLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setIsCancelling(true);
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      alert("Failed to cancel appointment. Please try again.");
      setIsCancelling(false);
      return;
    }

    fetchAppointment();
    setIsCancelling(false);
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
          href="/senior/my-appointments"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Appointments
        </Link>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="text-success-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-success-700 mb-1">Appointment Booked!</p>
              <p className="text-sm text-success-600">
                Your appointment has been successfully booked. The specialist will be notified.
              </p>
            </div>
          </motion.div>
        )}

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
            {appointment.status === "pending" && (
              <Button
                variant="outline"
                onClick={handleCancel}
                isLoading={isCancelling}
                className="text-error-500 border-error-500 hover:bg-error-50"
              >
                <X size={18} className="mr-2" />
                Cancel Appointment
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <User size={18} />
                  <span className="text-sm font-medium">Specialist</span>
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {appointment.specialist?.full_name}
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

            {appointment.notes && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-3">Notes</h2>
                <p className="text-text-secondary whitespace-pre-line bg-secondary-50 p-4 rounded-lg">
                  {appointment.notes}
                </p>
              </div>
            )}

            {appointment.cancelled_at && (
              <div className="bg-error-50 border border-error-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-error-700 mb-1">Cancelled</p>
                <p className="text-sm text-error-600">
                  {new Date(appointment.cancelled_at).toLocaleString()}
                </p>
                {appointment.cancellation_reason && (
                  <p className="text-sm text-error-600 mt-2">
                    Reason: {appointment.cancellation_reason}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t flex-wrap">
              {appointment.status !== "cancelled" && (
                <>
                  {/* Check if payment is needed */}
                  {(() => {
                    // This would check payment status - for now showing payment button
                    const needsPayment = appointment.status === "pending" || appointment.status === "confirmed";
                    return needsPayment ? (
                      <Link href={`/senior/my-appointments/${appointment.id}/payment`}>
                        <Button variant="primary">
                          <DollarSign size={18} className="mr-2" />
                          Pay Now
                        </Button>
                      </Link>
                    ) : null;
                  })()}
                  {appointment.status === "completed" && (
                    <Link href={`/senior/my-appointments/${appointment.id}/review`}>
                      <Button variant="accent">
                        <Star size={18} className="mr-2" />
                        Write Review
                      </Button>
                    </Link>
                  )}
                  <Link href={`/senior/messages?specialist=${appointment.specialist?.user_id}`}>
                    <Button variant="secondary">
                      <MessageSquare size={18} className="mr-2" />
                      Message Specialist
                    </Button>
                  </Link>
                </>
              )}
              <Link href={`/specialists/${appointment.specialist?.user_id}`}>
                <Button variant="outline">View Specialist Profile</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AppointmentDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <AppointmentDetailPageContent />
    </Suspense>
  );
}

