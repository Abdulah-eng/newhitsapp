"use client";

import { useState } from "react";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type ChangePasswordCardProps = {
  title?: string;
  description?: string;
  className?: string;
};

type Message = {
  type: "success" | "error";
  text: string;
};

export default function ChangePasswordCard({
  title = "Change Password",
  description = "Update your password regularly to keep your account secure.",
  className = "",
}: ChangePasswordCardProps) {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user?.email) {
      setMessage({ type: "error", text: "You must be signed in to change your password." });
      return;
    }

    if (!currentPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Re-authenticate the user with their current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setMessage({ type: "error", text: "Current password is incorrect." });
        setIsSubmitting(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage({ type: "error", text: updateError.message || "Unable to update password." });
      } else {
        setMessage({ type: "success", text: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className={`card bg-white p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-primary-50 text-primary-500">
          <Lock size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success"
              ? "bg-success-50 border border-success-200"
              : "bg-error-50 border border-error-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="text-success-500 mt-0.5" size={18} />
          ) : (
            <AlertCircle className="text-error-500 mt-0.5" size={18} />
          )}
          <p className={`text-sm ${message.type === "success" ? "text-success-700" : "text-error-700"}`}>
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Current Password</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your current password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Choose a new password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Confirm New Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            required
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-secondary-100">
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}


