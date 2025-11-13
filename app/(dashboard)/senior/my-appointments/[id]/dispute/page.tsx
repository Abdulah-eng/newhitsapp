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
import { ArrowLeft, AlertCircle, FileText } from "lucide-react";

function CreateDisputePageContent() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: "cancellation" as "review" | "cancellation" | "payment",
    reason: "",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && user?.id && params.id) {
      fetchAppointment();
    }
  }, [user, authLoading, params.id]);

  const fetchAppointment = async () => {
    setIsLoading(true);
    
    const appointmentId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!appointmentId) {
      router.push("/senior/my-appointments");
      setIsLoading(false);
      return;
    }
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        *,
        specialist:specialist_id(id, full_name)
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointmentData) {
      console.error("Error fetching appointment:", appointmentError);
      router.push("/senior/my-appointments");
      setIsLoading(false);
      return;
    }

    if (appointmentData.senior_id !== user?.id) {
      router.push("/senior/my-appointments");
      setIsLoading(false);
      return;
    }

    // Determine dispute type based on appointment status
    let disputeType: "review" | "cancellation" | "payment" = "cancellation";
    if (appointmentData.status === "completed") {
      disputeType = "review";
    } else if (appointmentData.status === "cancelled") {
      disputeType = "cancellation";
    }

    setAppointment(appointmentData);
    setFormData((prev) => ({ ...prev, type: disputeType }));
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!formData.description.trim()) {
      setError("Please provide a description of the issue");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create dispute record
      const { data: disputeData, error: disputeError } = await supabase
        .from("disputes")
        .insert({
          type: formData.type,
          appointment_id: appointment.id,
          senior_id: user!.id,
          specialist_id: appointment.specialist_id,
          reason: formData.reason || formData.description,
          description: formData.description,
          status: "open",
        })
        .select()
        .single();

      if (disputeError) {
        throw disputeError;
      }

      // Log dispute creation
      try {
        await fetch("/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "dispute_created",
            description: `Dispute created: ${formData.type}`,
            metadata: {
              dispute_id: disputeData.id,
              dispute_type: formData.type,
              appointment_id: appointment.id,
              reason: formData.reason || formData.description,
            },
          }),
        });
      } catch (err) {
        console.error("Error logging dispute creation:", err);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/senior/my-appointments/${appointment.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create dispute. Please try again.");
      setIsSubmitting(false);
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

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="card bg-white p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-success-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Dispute Submitted
            </h2>
            <p className="text-text-secondary">
              Your dispute has been submitted successfully. Our team will review it and get back to you soon.
            </p>
          </div>
          <Link href={`/senior/my-appointments/${appointment.id}`}>
            <Button variant="primary">Return to Appointment</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href={`/senior/my-appointments/${appointment.id}`}
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Appointment
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Report an Issue
          </h1>
          <p className="text-xl text-text-secondary">
            Help us understand the problem with your appointment
          </p>
        </motion.div>

        <motion.div variants={slideUp} className="card bg-white p-8">
          <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">Appointment Details</h3>
            <p className="text-sm text-text-secondary">
              <strong>Specialist:</strong> {appointment.specialist?.full_name || "Unknown"}
            </p>
            <p className="text-sm text-text-secondary">
              <strong>Date:</strong> {new Date(appointment.scheduled_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-text-secondary">
              <strong>Status:</strong> {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Issue Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input"
              >
                <option value="cancellation">Cancellation Issue</option>
                <option value="review">Service Quality Issue</option>
                <option value="payment">Payment Issue</option>
              </select>
              <p className="text-xs text-text-tertiary mt-1">
                Select the type of issue you're reporting. Default is based on appointment status.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Brief Summary <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., Appointment cancelled without notice"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                maxLength={200}
              />
              <p className="text-xs text-text-tertiary mt-1">
                A short summary of the issue (optional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Detailed Description <span className="text-error-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide as much detail as possible about the issue..."
                className="input min-h-[150px] resize-y"
                required
              />
              <p className="text-xs text-text-tertiary mt-1">
                Please include dates, times, and any relevant information that will help us resolve this issue.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href={`/senior/my-appointments/${appointment.id}`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                <FileText size={18} className="mr-2" />
                Submit Dispute
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CreateDisputePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <CreateDisputePageContent />
    </Suspense>
  );
}

