"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-100 px-4 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="w-full max-w-md"
        >
          <motion.div
            variants={slideUp}
            className="card bg-white p-8 shadow-large text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mb-6"
            >
              <CheckCircle className="w-16 h-16 text-success-500 mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-bold text-primary-500 mb-4">
              Check Your Email
            </h1>
            <p className="text-text-secondary mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100 px-4 py-12">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <motion.div variants={slideUp} className="card bg-white p-8 shadow-large">
          <Link
            href="/login"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Sign In
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">
              Forgot Password?
            </h1>
            <p className="text-text-secondary">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-error-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

