"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Star, MapPin, DollarSign, Clock, CheckCircle, ArrowLeft, Calendar } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

function SpecialistDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [specialist, setSpecialist] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSpecialist();
    }
  }, [params.id]);

  useEffect(() => {
    if (specialist?.user_id) {
      fetchReviews();
    }
  }, [specialist]);

  const fetchSpecialist = async () => {
    const { data, error } = await supabase
      .from("specialist_profiles")
      .select("*, user:user_id(full_name, avatar_url, email)")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching specialist:", error);
      router.push("/specialists");
      return;
    }

    setSpecialist(data);
    setIsLoading(false);
  };

  const fetchReviews = async () => {
    if (!specialist?.user_id) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("*, senior:senior_id(full_name)")
      .eq("specialist_id", specialist.user_id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setReviews(data);
    }
  };

  const handleBookAppointment = () => {
    if (!user) {
      router.push("/login?redirect=/specialists/" + params.id);
      return;
    }
    if (user.role === "senior") {
      router.push(`/senior/book-appointment?specialist=${params.id}`);
    } else {
      router.push("/register?role=senior");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!specialist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Link
            href="/specialists"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Specialists
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <motion.div variants={slideUp} className="card bg-white p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-text-primary">
                        {specialist.user.full_name}
                      </h1>
                      {specialist.verification_status === "verified" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-50 text-success-600 rounded-lg text-sm">
                          <CheckCircle size={16} />
                          Verified Specialist
                        </span>
                      )}
                    </div>
                    {specialist.rating_average > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={
                                i < Math.floor(specialist.rating_average)
                                  ? "text-warning-500 fill-current"
                                  : "text-secondary-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-text-primary">
                          {specialist.rating_average.toFixed(1)}
                        </span>
                        <span className="text-text-tertiary">
                          ({specialist.total_reviews} review{specialist.total_reviews !== 1 ? "s" : ""})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {specialist.bio && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-3">About</h2>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                      {specialist.bio}
                    </p>
                  </div>
                )}

                {specialist.specialties && specialist.specialties.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-3">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {specialist.specialties.map((specialty: string) => (
                        <span
                          key={specialty}
                          className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {specialist.service_areas && specialist.service_areas.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-3">Service Areas</h2>
                    <div className="flex flex-wrap gap-2">
                      {specialist.service_areas.map((area: string) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-accent-50 text-accent-700 rounded-lg"
                        >
                          <MapPin size={16} />
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <motion.div variants={slideUp} className="card bg-white p-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Reviews</h2>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-secondary-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-text-primary mb-1">
                              {review.senior?.full_name || "Anonymous"}
                            </h3>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i < review.rating
                                      ? "text-warning-500 fill-current"
                                      : "text-secondary-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-text-tertiary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-text-secondary mt-3">{review.comment}</p>
                        )}
                        {review.response_text && (
                          <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                            <p className="text-sm font-semibold text-text-primary mb-1">
                              Response from {specialist.user.full_name}:
                            </p>
                            <p className="text-sm text-text-secondary">{review.response_text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div variants={slideUp} className="card bg-white p-6 sticky top-4">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-text-secondary">Hourly Rate</span>
                      <div className="flex items-center gap-1 text-2xl font-bold text-primary-500">
                        <DollarSign size={24} />
                        {specialist.hourly_rate}
                      </div>
                    </div>
                    {specialist.years_experience && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-text-secondary">Experience</span>
                        <span className="font-semibold text-text-primary">
                          {specialist.years_experience} years
                        </span>
                      </div>
                    )}
                    {specialist.total_appointments > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">Appointments</span>
                        <span className="font-semibold text-text-primary">
                          {specialist.total_appointments} completed
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-secondary-200">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleBookAppointment}
                    >
                      <Calendar size={20} className="mr-2" />
                      Book Appointment
                    </Button>
                  </div>

                  {specialist.languages_spoken && specialist.languages_spoken.length > 0 && (
                    <div className="pt-6 border-t border-secondary-200">
                      <h3 className="font-semibold text-text-primary mb-2">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {specialist.languages_spoken.map((lang: string) => (
                          <span
                            key={lang}
                            className="px-3 py-1 bg-secondary-200 text-text-primary rounded text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SpecialistDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <SpecialistDetailPageContent />
    </Suspense>
  );
}

