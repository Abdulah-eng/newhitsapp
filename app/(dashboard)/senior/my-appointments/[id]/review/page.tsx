"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import ReviewForm from "@/components/features/ReviewForm";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Star, User } from "lucide-react";

function ReviewPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [appointment, setAppointment] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.id && params.id) {
      fetchData();
    }
  }, [user, authLoading, params.id]);

  const fetchData = async () => {
    const { data: apt, error } = await supabase
      .from("appointments")
      .select("*, specialist:specialist_id(id, user_id, full_name)")
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

    // Check for existing review
    const { data: review } = await supabase
      .from("reviews")
      .select("*")
      .eq("appointment_id", params.id)
      .single();

    if (review) {
      setExistingReview(review);
    }

    setIsLoading(false);
  };

  const handleSubmit = async (rating: number, comment: string) => {
    if (!appointment || !user?.id) return;

    const { error } = await supabase.from("reviews").insert({
      appointment_id: appointment.id,
      senior_id: user.id,
      specialist_id: appointment.specialist_id,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Refresh to show the new review
    router.push(`/senior/my-appointments/${params.id}?review=success`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (existingReview) {
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
            <Star className="w-16 h-16 text-warning-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Review Already Submitted
            </h1>
            <p className="text-text-secondary mb-6">
              You have already submitted a review for this appointment.
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
            Write a Review
          </h1>
          <p className="text-xl text-text-secondary">
            Share your experience with {appointment?.specialist?.full_name || "the specialist"}
          </p>
        </motion.div>

        <motion.div variants={slideUp} className="card bg-white p-8">
          <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {appointment?.specialist?.full_name || "Specialist"}
                </h3>
                <p className="text-sm text-text-secondary">
                  Appointment on{" "}
                  {appointment?.scheduled_at
                    ? new Date(appointment.scheduled_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <ReviewForm
            appointmentId={params.id as string}
            specialistId={appointment?.specialist_id}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/senior/my-appointments/${params.id}`)}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}

