"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import PaymentForm from "@/components/features/PaymentForm";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, Clock, CheckCircle } from "lucide-react";

function PaymentPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [appointment, setAppointment] = useState<any>(null);
  const [specialist, setSpecialist] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!authLoading && user?.id && params.id) {
      fetchAppointmentData();
    }
  }, [user, authLoading, params.id]);

  const fetchAppointmentData = async () => {
    const { data: apt, error } = await supabase
      .from("appointments")
      .select("*, specialist:specialist_id(id, user_id, hourly_rate), specialist_profile:specialist_id(id, hourly_rate)")
      .eq("id", params.id)
      .single();

    if (error || !apt) {
      router.push("/senior/my-appointments");
      return;
    }

    if (apt.senior_id !== user?.id) {
      router.push("/senior/my-appointments");
      return;
    }

    setAppointment(apt);
    setSpecialist(apt.specialist || apt.specialist_profile);

    // Calculate amount
    const hourlyRate = apt.specialist_profile?.hourly_rate || apt.specialist?.hourly_rate || 0;
    const durationHours = apt.duration_minutes / 60;
    setAmount(hourlyRate * durationHours);

    // Check for existing payment
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", params.id)
      .eq("status", "completed")
      .single();

    if (existingPayment) {
      setPayment(existingPayment);
    }

    setIsLoading(false);
  };

  const handlePaymentSuccess = () => {
    setTimeout(() => {
      router.push(`/senior/my-appointments/${params.id}?payment=success`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (payment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Link
            href={`/senior/my-appointments/${params.id}`}
            className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Appointment
          </Link>

          <motion.div variants={slideUp} className="card bg-white p-8 text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Payment Already Completed
            </h1>
            <p className="text-text-secondary mb-6">
              This appointment has already been paid for.
            </p>
            <Link href={`/senior/my-appointments/${params.id}`}>
              <Button variant="primary">View Appointment</Button>
            </Link>
          </motion.div>
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
          href={`/senior/my-appointments/${params.id}`}
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Appointment
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Complete Payment
          </h1>
          <p className="text-xl text-text-secondary">
            Secure payment for your appointment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Summary */}
          <motion.div variants={slideUp} className="lg:col-span-1">
            <div className="card bg-white p-6 sticky top-4">
              <h2 className="text-xl font-bold text-text-primary mb-6">
                Payment Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-text-secondary mb-1">Specialist</p>
                  <p className="font-semibold text-text-primary">
                    {specialist?.user?.full_name || "Specialist"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Appointment Date</p>
                  <div className="flex items-center gap-2 text-text-primary">
                    <Calendar size={16} />
                    <span>
                      {appointment?.scheduled_at
                        ? new Date(appointment.scheduled_at).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Duration</p>
                  <div className="flex items-center gap-2 text-text-primary">
                    <Clock size={16} />
                    <span>{appointment?.duration_minutes || 0} minutes</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-text-secondary">Hourly Rate</span>
                    <span className="font-semibold">
                      ${specialist?.hourly_rate?.toFixed(2) || "0.00"}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-text-primary">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-primary-500">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <div className="card bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="text-primary-500" size={24} />
                <h2 className="text-2xl font-bold text-text-primary">
                  Payment Information
                </h2>
              </div>
              <PaymentForm
                appointmentId={params.id as string}
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}

