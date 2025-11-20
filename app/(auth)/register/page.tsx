"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle } from "lucide-react";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "senior" as UserRole,
    isDisabledAdult: false,
    isCaregiver: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const triggerWelcomeEmail = async (userId: string) => {
    try {
      const response = await fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        console.error("Welcome email API returned non-200 status");
      }
    } catch (err) {
      console.error("Failed to trigger welcome email:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create user account. Please try again.");
        setIsLoading(false);
        return;
      }

      await triggerWelcomeEmail(authData.user.id);

      // Check if email confirmation is required
      // If session is null, try to get it (might be a timing issue)
      let session = authData.session;
      
      if (!session) {
        // Try to get session after a short delay (in case of timing issues)
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        session = retrySession;
      }

      // If no session, email confirmation likely required
      if (!session) {
        setIsLoading(false);
        router.push("/login?message=Account created! Please check your email to confirm your account, then sign in.");
        return;
      }

      // Create role-specific profile
      if (formData.role === "senior") {
        // Create senior profile
        const { error: profileError } = await supabase
          .from("senior_profiles")
          .insert({
            user_id: authData.user.id,
            is_disabled_adult: formData.isDisabledAdult,
          });

        if (profileError) {
          console.error("Error creating senior profile:", profileError);
          // Continue anyway - profile can be created later
        }

        // Log registration
        try {
          await fetch("/api/activity/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "user_registered",
              description: `User registered: ${formData.email} (senior)`,
              metadata: { email: formData.email, role: "senior", is_disabled_adult: formData.isDisabledAdult },
            }),
          });
        } catch (err) {
          // Don't block registration if logging fails
          console.error("Error logging registration:", err);
        }

        router.replace("/senior/dashboard");
      } else if (formData.role === "specialist") {
        // Create specialist profile
        const { error: profileError } = await supabase
          .from("specialist_profiles")
          .insert({
            user_id: authData.user.id,
          });

        if (profileError) {
          console.error("Error creating specialist profile:", profileError);
          // Continue anyway - profile can be created later
        }

        // Log registration
        try {
          await fetch("/api/activity/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "user_registered",
              description: `User registered: ${formData.email} (specialist)`,
              metadata: { email: formData.email, role: "specialist" },
            }),
          });
        } catch (err) {
          // Don't block registration if logging fails
          console.error("Error logging registration:", err);
        }

        router.replace("/specialist/dashboard?welcome=true");
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
        className="w-full max-w-2xl"
      >
        <motion.div
          variants={slideUp}
          className="card bg-white p-8 shadow-large"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">
              Create Your Account
            </h1>
            <p className="text-text-secondary">
              Join HITS to connect with technology specialists
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

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={staggerItem}>
                <label className="block text-base font-medium text-text-primary mb-2">
                  I am a...
                  <span className="text-error-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "senior", isCaregiver: false })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === "senior" && !formData.isCaregiver
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-300 hover:border-primary-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👴</div>
                      <div className="font-medium">Senior User</div>
                      <div className="text-sm text-text-tertiary mt-1">
                        I need tech help
                      </div>
                    </div>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "specialist" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === "specialist"
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-300 hover:border-primary-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💻</div>
                      <div className="font-medium">IT Specialist</div>
                      <div className="text-sm text-text-tertiary mt-1">
                        I provide tech help
                      </div>
                    </div>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "senior" as UserRole, isCaregiver: true })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.isCaregiver
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-300 hover:border-primary-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
                      <div className="font-medium">Caregiver / Family Member</div>
                      <div className="text-sm text-text-tertiary mt-1">
                        I'm booking for someone else
                      </div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="fullName"
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
                <Input
                  name="phone"
                  type="tel"
                  label="Phone Number (Optional)"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </motion.div>

              <motion.div variants={staggerItem}>
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </motion.div>

              <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </motion.div>

              {formData.role === "senior" && (
                <motion.div variants={staggerItem}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDisabledAdult}
                      onChange={(e) => setFormData({ ...formData, isDisabledAdult: e.target.checked })}
                      className="w-5 h-5 text-primary-500 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-base text-text-primary">
                      I have a disability or accessibility needs.
                    </span>
                  </label>
                  <p className="text-sm text-text-secondary mt-1 ml-8">
                    This helps us match you with a specialist and support that fit your needs.
                  </p>
                </motion.div>
              )}

              <motion.div variants={staggerItem}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </motion.div>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="link font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

