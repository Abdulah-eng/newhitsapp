"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Save, CheckCircle, AlertCircle, ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function SeniorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    preferred_contact_method: "email",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    // Fetch senior profile
    const { data: profileData, error: profileError } = await supabase
      .from("senior_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userError && userError.code !== "PGRST116") {
      console.error("Error fetching user:", userError);
    }

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError);
    }

    if (userData) {
      setFormData((prev) => ({
        ...prev,
        full_name: userData.full_name || "",
        phone: userData.phone || "",
      }));
    }

    if (profileData) {
      setProfile(profileData);
      setFormData((prev) => ({
        ...prev,
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zip_code: profileData.zip_code || "",
        preferred_contact_method: profileData.preferred_contact_method || "email",
        emergency_contact_name: profileData.emergency_contact_name || "",
        emergency_contact_phone: profileData.emergency_contact_phone || "",
      }));
    }

    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    if (!user?.id) return;

    try {
      // Update user table
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Update or create senior profile
      const { error: profileError } = await supabase
        .from("senior_profiles")
        .upsert({
          user_id: user.id,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
          preferred_contact_method: formData.preferred_contact_method,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (profileError) throw profileError;

      setMessage({ type: "success", text: "Profile saved successfully!" });
      fetchProfile();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/senior/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">Profile</h1>
          <p className="text-xl text-text-secondary">
            Manage your personal information and preferences
          </p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === "success"
                ? "bg-success-50 border border-success-200"
                : "bg-error-50 border border-error-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="text-success-500 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
            )}
            <p
              className={`text-sm ${
                message.type === "success" ? "text-success-700" : "text-error-700"
              }`}
            >
              {message.text}
            </p>
          </motion.div>
        )}

        <motion.div variants={slideUp} className="card bg-white p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <User size={24} />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-text-primary mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-secondary-50"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>
                <div>
                  <label htmlFor="preferred_contact_method" className="block text-sm font-semibold text-text-primary mb-2">
                    Preferred Contact Method *
                  </label>
                  <select
                    id="preferred_contact_method"
                    name="preferred_contact_method"
                    required
                    value={formData.preferred_contact_method}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <MapPin size={24} />
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-text-primary mb-2">
                    Street Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-text-primary mb-2">
                    City
                  </label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-text-primary mb-2">
                    State
                  </label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-semibold text-text-primary mb-2">
                    ZIP Code
                  </label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    type="text"
                    value={formData.zip_code}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Phone size={24} />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergency_contact_name" className="block text-sm font-semibold text-text-primary mb-2">
                    Emergency Contact Name
                  </label>
                  <Input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    placeholder="Contact's full name"
                  />
                </div>
                <div>
                  <label htmlFor="emergency_contact_phone" className="block text-sm font-semibold text-text-primary mb-2">
                    Emergency Contact Phone
                  </label>
                  <Input
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-4 italic">
                Please don't enter Social Security numbers or full bank card numbers here.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link href="/senior/dashboard">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" isLoading={isSaving}>
                <Save size={18} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

