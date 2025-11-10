"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const hashParams = window.location.hash.substring(1);
    if (!hashParams && !searchParams.get("access_token")) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
              Password Reset Successful
            </h1>
            <p className="text-text-secondary mb-6">
              Your password has been updated. Redirecting to login...
            </p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">
              Reset Your Password
            </h1>
            <p className="text-text-secondary">
              Enter your new password below.
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
              type="password"
              label="New Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-secondary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

