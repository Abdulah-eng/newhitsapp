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
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let isMounted = true;

    const establishSession = async () => {
      try {
        setSessionLoading(true);
        setError("");

        const hashParams = window.location.hash.substring(1);
        const queryCode = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const token = searchParams.get("token");
        const emailParam = searchParams.get("email");
        let sessionEstablished = false;

        if (queryCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryCode);
          if (exchangeError) {
            throw exchangeError;
          }
          sessionEstablished = true;
        } else if (tokenHash) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: tokenHash,
          });

          if (verifyError) {
            throw verifyError;
          }

          const url = new URL(window.location.href);
          url.searchParams.delete("token_hash");
          url.searchParams.delete("token");
          window.history.replaceState({}, document.title, url.toString());
          sessionEstablished = true;
        } else if (token) {
          if (!emailParam) {
            throw new Error("Invalid reset link. Email parameter missing.");
          }

          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: "recovery",
            email: emailParam,
            token,
          });

          if (verifyError) {
            throw verifyError;
          }

          const url = new URL(window.location.href);
          url.searchParams.delete("token");
          window.history.replaceState({}, document.title, url.toString());
          sessionEstablished = true;
        } else if (hashParams) {
          const params = new URLSearchParams(hashParams);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionError) {
              throw setSessionError;
            }

            // Clean up URL to remove sensitive tokens
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            sessionEstablished = true;
          }
        }

        if (!sessionEstablished) {
          throw new Error("Invalid or expired reset link. Please request a new one.");
        }

        if (isMounted) {
          setIsSessionReady(true);
        }
      } catch (sessionError: any) {
        console.error("Error establishing reset session:", sessionError);
        if (isMounted) {
          setError(sessionError.message || "Invalid or expired reset link. Please request a new one.");
          setIsSessionReady(false);
        }
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    };

    establishSession();

    return () => {
      isMounted = false;
    };
  }, [searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isSessionReady) {
      setError("Reset session is not ready. Please open the password reset link from your email again.");
      return;
    }

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

          {sessionLoading && (
            <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg text-sm text-text-secondary">
              Validating your reset link...
            </div>
          )}

          {!sessionLoading && !isSessionReady && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
              Unable to validate the reset link. Please request a new password reset email.
            </div>
          )}

          {!sessionLoading && isSessionReady && (
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
          )}
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

