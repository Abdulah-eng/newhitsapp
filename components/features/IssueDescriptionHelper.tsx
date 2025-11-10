"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { fadeIn } from "@/lib/animations/config";

interface IssueDescriptionHelperProps {
  value: string;
  onChange: (value: string) => void;
  onImproved?: (improved: string) => void;
}

export default function IssueDescriptionHelper({
  value,
  onChange,
  onImproved,
}: IssueDescriptionHelperProps) {
  const [isImproving, setIsImproving] = useState(false);
  const [showImproved, setShowImproved] = useState(false);
  const [improvedText, setImprovedText] = useState("");

  const handleImprove = async () => {
    if (!value.trim()) {
      alert("Please enter a description first");
      return;
    }

    setIsImproving(true);
    setShowImproved(false);

    try {
      const response = await fetch("/api/gemini/improve-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: value }),
      });

      const data = await response.json();

      if (data.improvedDescription) {
        setImprovedText(data.improvedDescription);
        setShowImproved(true);
        if (onImproved) {
          onImproved(data.improvedDescription);
        }
      }
    } catch (error) {
      console.error("Error improving description:", error);
      alert("Failed to improve description. Please try again.");
    } finally {
      setIsImproving(false);
    }
  };

  const useImproved = () => {
    onChange(improvedText);
    setShowImproved(false);
  };

  return (
    <div className="space-y-4">
      {showImproved && improvedText && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-success-50 border border-success-200 rounded-lg"
        >
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle className="text-success-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-success-700 mb-2">
                AI-Improved Description
              </h4>
              <p className="text-sm text-success-600 mb-3 whitespace-pre-line">
                {improvedText}
              </p>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={useImproved}>
                  Use This Version
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImproved(false)}
                >
                  Keep Original
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleImprove}
          disabled={isImproving || !value.trim()}
          className="whitespace-nowrap"
        >
          {isImproving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Improving...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Improve with AI
            </>
          )}
        </Button>
        <p className="text-sm text-text-tertiary">
          Let AI help you describe your issue more clearly
        </p>
      </div>
    </div>
  );
}

