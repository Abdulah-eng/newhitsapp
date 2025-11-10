"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Loader2 } from "lucide-react";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations/config";

interface SmartRecommendationsProps {
  issueDescription: string;
}

export default function SmartRecommendations({
  issueDescription,
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (issueDescription.trim().length > 20 && !hasFetched) {
      fetchRecommendations();
    }
  }, [issueDescription]);

  const fetchRecommendations = async () => {
    if (!issueDescription.trim() || isLoading) return;

    setIsLoading(true);
    setHasFetched(true);

    try {
      const response = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ issueDescription }),
      });

      const data = await response.json();

      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className="card bg-white p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-warning-500" size={20} />
        <h3 className="text-lg font-semibold text-text-primary">
          Helpful Tips
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-tertiary">
          <Loader2 size={16} className="animate-spin" />
          <span>Getting recommendations...</span>
        </div>
      ) : (
        <motion.ul
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {recommendations.map((rec, index) => (
            <motion.li
              key={index}
              variants={staggerItem}
              className="flex items-start gap-3 text-text-secondary"
            >
              <span className="text-primary-500 font-bold mt-0.5">
                {index + 1}.
              </span>
              <span>{rec}</span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}

