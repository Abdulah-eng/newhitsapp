"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const role = (data.user.user_metadata?.role as string) || "senior";
        
        // Log login
        try {
          await fetch("/api/activity/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "user_logged_in",
              description: `User logged in: ${email}`,
              metadata: { email, role },
            }),
          });
        } catch (err) {
          // Don't block login if logging fails
          console.error("Error logging login:", err);
        }

        // Check for admin email specifically
        if (email.toLowerCase() === "admin@hitsapp.com" || role === "admin") {
          router.replace("/admin/dashboard");
        } else if (role === "senior") {
          router.replace("/senior/dashboard");
        } else if (role === "specialist") {
          router.replace("/specialist/dashboard");
        } else {
          router.replace("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

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
          className="card bg-white p-8 shadow-large"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">
              Welcome Back
            </h1>
            <p className="text-text-secondary">
              Sign in to your H.I.T.S. account
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="text-primary-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-primary-700">{message}</p>
            </motion.div>
          )}

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

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Link
                href="/forgot-password"
                className="block text-sm text-primary-500 hover:text-primary-600 mt-2 text-right transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="link font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-secondary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

