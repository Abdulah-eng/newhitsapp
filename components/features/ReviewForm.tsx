"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Star, Send, AlertCircle, CheckCircle } from "lucide-react";
import { fadeIn } from "@/lib/animations/config";

interface ReviewFormProps {
  appointmentId: string;
  specialistId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({
  appointmentId,
  specialistId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(rating, comment);
      setSuccess(true);
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-success-50 border border-success-200 rounded-lg text-center"
      >
        <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-success-700 mb-2">
          Thank You!
        </h3>
        <p className="text-success-600">
          Your review has been submitted successfully.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial="initial"
      animate="animate"
      variants={fadeIn}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-base font-medium text-text-primary mb-3">
          Rating <span className="text-error-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Star
                size={40}
                className={`transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-warning-500 fill-current"
                    : "text-secondary-300"
                }`}
              />
            </motion.button>
          ))}
          {rating > 0 && (
            <span className="ml-4 text-lg font-semibold text-text-primary">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-text-primary mb-2">
          Your Review (Optional)
        </label>
        <textarea
          className="input min-h-[120px] resize-y"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this specialist..."
          rows={5}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-error-700">{error}</p>
        </motion.div>
      )}

      <div className="flex gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={rating === 0}
          className="flex-1"
        >
          <Send size={18} className="mr-2" />
          Submit Review
        </Button>
      </div>
    </motion.form>
  );
}

