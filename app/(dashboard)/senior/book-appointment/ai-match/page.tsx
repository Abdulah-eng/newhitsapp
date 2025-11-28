"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, Star, Clock, ArrowLeft, Loader2 } from "lucide-react";

interface MatchedSpecialist {
  id: string;
  user_id: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  rating_average: number;
  total_reviews: number;
  matchScore: number;
  matchReasoning: string;
  user: {
    full_name: string;
  };
}

function AIMatchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [issueDescription, setIssueDescription] = useState("");
  const [matchedSpecialists, setMatchedSpecialists] = useState<MatchedSpecialist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
  }, [user, authLoading, router]);

  const handleMatch = async () => {
    if (!issueDescription.trim()) {
      setError("Please describe your issue");
      return;
    }

    setIsLoading(true);
    setError("");
    setMatchedSpecialists([]);

    try {
      const response = await fetch("/api/gemini/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issueDescription: issueDescription.trim(),
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setMatchedSpecialists(data.matches || []);
    } catch (error) {
      console.error("Error matching specialists:", error);
      setError("Failed to find matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user || user.role === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user.role !== "senior") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/senior/book-appointment"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Booking
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-primary-500" size={32} />
            <h1 className="text-4xl font-bold text-primary-500">
              AI-Powered Specialist Matching
            </h1>
          </div>
          <p className="text-xl text-text-secondary">
            Describe your issue and we'll find the best specialist for you
          </p>
          <p className="text-sm text-text-secondary mt-3">
            Your description is only used to match you with a specialist. Please don't include passwords or full account numbers.
          </p>
        </motion.div>

        <motion.div variants={slideUp} className="card bg-white p-8 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-text-primary mb-2">
                Describe Your Technology Issue
              </label>
              <textarea
                className="input min-h-[150px] resize-y w-full"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Example: My computer is running very slowly and I can't figure out why. It takes forever to open programs..."
                rows={6}
              />
            </div>

            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleMatch}
              isLoading={isLoading}
              className="w-full"
            >
              <Sparkles size={20} className="mr-2" />
              Find Best Matches
            </Button>
          </div>
        </motion.div>

        {/* Matched Specialists */}
        {matchedSpecialists.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Recommended Specialists
            </h2>
            {matchedSpecialists.map((specialist, index) => (
              <motion.div
                key={specialist.id}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-text-primary">
                        {specialist.user.full_name}
                      </h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded text-sm font-semibold">
                        <Sparkles size={14} />
                        {Math.round(specialist.matchScore * 100)}% Match
                      </div>
                    </div>
                    {specialist.matchReasoning && (
                      <p className="text-text-secondary text-sm mb-3 italic">
                        "{specialist.matchReasoning}"
                      </p>
                    )}
                    {specialist.bio && (
                      <p className="text-text-secondary mb-3 line-clamp-2">
                        {specialist.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {specialist.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      {specialist.rating_average > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={16} className="text-warning-500 fill-current" />
                          {specialist.rating_average.toFixed(1)} ({specialist.total_reviews} reviews)
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        $95/hr (Platform Rate)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Link
                    href={`/senior/book-appointment?specialist=${specialist.id}`}
                    className="flex-1"
                  >
                    <Button variant="primary" className="w-full">
                      Book with This Specialist
                    </Button>
                  </Link>
                  <Link href={`/specialists/${specialist.id}`}>
                    <Button variant="outline">View Profile</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isLoading && (
          <div className="card bg-white p-12 text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">
              Analyzing your issue and finding the best specialists...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AIMatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <AIMatchPageContent />
    </Suspense>
  );
}

