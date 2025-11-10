"use client";

import { motion } from "framer-motion";
import { Star, User, MessageSquare } from "lucide-react";
import { fadeIn } from "@/lib/animations/config";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    response_text?: string;
    response_created_at?: string;
    created_at: string;
    senior?: {
      full_name: string;
    };
    specialist?: {
      full_name: string;
    };
  };
  showResponse?: boolean;
}

export default function ReviewCard({ review, showResponse = true }: ReviewCardProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="card bg-white p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">
                {review.senior?.full_name || review.specialist?.full_name || "Anonymous"}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= review.rating
                        ? "text-warning-500 fill-current"
                        : "text-secondary-300"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <span className="text-sm text-text-tertiary">
          {new Date(review.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {review.comment && (
        <p className="text-text-secondary mb-4 whitespace-pre-line">
          {review.comment}
        </p>
      )}

      {showResponse && review.response_text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-secondary-50 rounded-lg border-l-4 border-primary-500"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-primary-500" />
            <span className="text-sm font-semibold text-text-primary">
              Response from {review.specialist?.full_name || "Specialist"}
            </span>
            {review.response_created_at && (
              <span className="text-xs text-text-tertiary ml-auto">
                {new Date(review.response_created_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-text-secondary text-sm whitespace-pre-line">
            {review.response_text}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

