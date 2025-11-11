"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
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
  const [appointmentId, setAppointmentId] = useState<string>("");

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (id) {
      setAppointmentId(id);
    }
  }, [params.id]);

  const fetchAppointmentData = useCallback(async () => {
    if (!appointmentId) {
      console.error("No appointment ID provided");
      router.push("/senior/my-appointments");
      return;
    }

    setIsLoading(true);

    // Fetch appointment
    const { data: apt, error: aptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (aptError || !apt) {
      console.error("Error fetching appointment:", aptError);
      router.push("/senior/my-appointments");
      setIsLoading(false);
      return;
    }

    // Verify this appointment belongs to the current user
    if (apt.senior_id !== user?.id) {
      console.error("Appointment does not belong to current user");
      router.push("/senior/my-appointments");
      setIsLoading(false);
      return;
    }

    // Check if appointment is confirmed - payment can only be made for confirmed appointments
    if (apt.status !== "confirmed") {
      console.log("Appointment is not confirmed, redirecting to appointment detail");
      router.replace(`/senior/my-appointments/${appointmentId}`);
      setIsLoading(false);
      return;
    }

    // Fetch specialist user details
    const { data: specialistUser, error: specialistUserError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", apt.specialist_id)
      .single();

    if (specialistUserError) {
      console.error("Error fetching specialist user:", specialistUserError);
    }

    // Fetch specialist profile for hourly rate
    const { data: specialistProfile, error: profileError } = await supabase
      .from("specialist_profiles")
      .select("id, hourly_rate")
      .eq("user_id", apt.specialist_id)
      .single();

    if (profileError) {
      console.error("Error fetching specialist profile:", profileError);
    }

    // Combine data
    const appointmentWithSpecialist = {
      ...apt,
      specialist: {
        user: {
          full_name: specialistUser?.full_name || "Specialist",
          id: specialistUser?.id || apt.specialist_id
        }
      }
    };

    setAppointment(appointmentWithSpecialist);
    setSpecialist({
      user: {
        full_name: specialistUser?.full_name || "Specialist",
        id: specialistUser?.id || apt.specialist_id
      },
      hourly_rate: specialistProfile?.hourly_rate || 0
    });

    // Calculate amount
    const hourlyRate = specialistProfile?.hourly_rate || 0;
    const durationHours = apt.duration_minutes / 60;
    const calculatedAmount = hourlyRate * durationHours;
    setAmount(calculatedAmount);

    // Check for existing payment
    const { data: existingPayment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", appointmentId)
      .eq("status", "completed")
      .maybeSingle();

    if (paymentError) {
      console.error("Error checking for existing payment:", paymentError);
    }

    if (existingPayment) {
      setPayment(existingPayment);
    }

    setIsLoading(false);
  }, [appointmentId, user?.id, router, supabase]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // If no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Wait a bit for role to be fetched if it's undefined
    if (user.role === undefined) {
      const timer = setTimeout(() => {
        // If role is still undefined or not senior after timeout, redirect
        if (!user || user.role !== "senior") {
          if (user?.role === "specialist") {
            router.replace("/specialist/dashboard");
          } else if (user?.role === "admin") {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/");
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // If role is defined and not senior, redirect appropriately
    if (user.role !== "senior") {
      if (user.role === "specialist") {
        router.replace("/specialist/dashboard");
      } else if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/");
      }
      return;
    }
    
    // User is senior, fetch appointment data if we have appointmentId
    if (user.id && appointmentId) {
      fetchAppointmentData();
    }
  }, [user, authLoading, appointmentId, router, fetchAppointmentData]);

  const handlePaymentSuccess = () => {
    if (!appointmentId) return;
    
    setTimeout(() => {
      router.replace(`/senior/my-appointments/${appointmentId}?payment=success`);
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
            href={`/senior/my-appointments/${appointmentId}`}
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
            <Link href={`/senior/my-appointments/${appointmentId}`}>
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
          href={`/senior/my-appointments/${appointmentId}`}
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
                appointmentId={appointmentId}
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

