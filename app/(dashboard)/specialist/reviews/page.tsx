"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import ReviewCard from "@/components/features/ReviewCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Star, Filter, Search, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  response_text?: string;
  response_created_at?: string;
  created_at: string;
  senior: {
    full_name: string;
  };
  appointment: {
    id: string;
    scheduled_at: string;
  };
}

export default function SpecialistReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchReviews();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterReviews();
  }, [reviews, ratingFilter, searchQuery]);

  const fetchReviews = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("*, senior:senior_id(full_name), appointment:appointment_id(id, scheduled_at)")
      .eq("specialist_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }

    const reviewsData = (data as Review[]) || [];
    setReviews(reviewsData);

    // Calculate stats
    if (reviewsData.length > 0) {
      const total = reviewsData.length;
      const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / total;

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsData.forEach((r) => {
        distribution[r.rating as keyof typeof distribution]++;
      });

      setStats({
        average,
        total,
        distribution,
      });
    }

    setIsLoading(false);
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    if (ratingFilter !== "all") {
      filtered = filtered.filter((r) => r.rating === parseInt(ratingFilter));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.senior.full_name.toLowerCase().includes(query) ||
          r.comment?.toLowerCase().includes(query)
      );
    }

    setFilteredReviews(filtered);
  };

  const handleResponse = async (reviewId: string, responseText: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({
        response_text: responseText,
        response_created_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      alert("Failed to submit response. Please try again.");
      return;
    }

    fetchReviews();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/specialist/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Reviews & Ratings
          </h1>
          <p className="text-xl text-text-secondary">
            See what clients are saying about your service
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={slideUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Average Rating</h3>
              <Star className="text-warning-500" size={24} />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-text-primary">
                {stats.average.toFixed(1)}
              </p>
              <span className="text-text-tertiary">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= Math.round(stats.average)
                      ? "text-warning-500 fill-current"
                      : "text-secondary-300"
                  }
                />
              ))}
            </div>
          </div>

          <div className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">Total Reviews</h3>
              <MessageSquare className="text-primary-500" size={24} />
            </div>
            <p className="text-4xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-sm text-text-tertiary mt-2">Client reviews</p>
          </div>

          <div className="card bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-secondary">5-Star Reviews</h3>
              <Star className="text-warning-500 fill-current" size={24} />
            </div>
            <p className="text-4xl font-bold text-text-primary">
              {stats.distribution[5]}
            </p>
            <p className="text-sm text-text-tertiary mt-2">
              {stats.total > 0
                ? Math.round((stats.distribution[5] / stats.total) * 100)
                : 0}
              % of total
            </p>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        {stats.total > 0 && (
          <motion.div variants={slideUp} className="card bg-white p-6 mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Rating Distribution
            </h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating as keyof typeof stats.distribution];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-20">
                      <span className="text-sm font-medium text-text-primary">
                        {rating}
                      </span>
                      <Star
                        size={16}
                        className="text-warning-500 fill-current"
                      />
                    </div>
                    <div className="flex-1 bg-secondary-100 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-warning-500 h-full rounded-full"
                      />
                    </div>
                    <span className="text-sm text-text-secondary w-16 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="input pl-10"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </motion.div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <Star className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary">
              {reviews.length === 0
                ? "No reviews yet"
                : "No reviews match your filters"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} showResponse={true} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

