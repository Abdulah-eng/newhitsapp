"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Save, Upload, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SpecialistProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    bio: "",
    specialties: [] as string[],
    hourly_rate: "",
    service_areas: [] as string[],
    years_experience: "",
    languages_spoken: [] as string[],
  });
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newServiceArea, setNewServiceArea] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("specialist_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      setFormData({
        bio: data.bio || "",
        specialties: data.specialties || [],
        hourly_rate: data.hourly_rate?.toString() || "",
        service_areas: data.service_areas || [],
        years_experience: data.years_experience?.toString() || "",
        languages_spoken: data.languages_spoken || [],
      });
    }

    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    if (!user?.id) return;

    const updateData = {
      bio: formData.bio,
      specialties: formData.specialties,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      service_areas: formData.service_areas,
      years_experience: parseInt(formData.years_experience) || null,
      languages_spoken: formData.languages_spoken,
    };

    const { error } = await supabase
      .from("specialist_profiles")
      .upsert({
        user_id: user.id,
        ...updateData,
      }, {
        onConflict: "user_id",
      });

    if (error) {
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
    } else {
      setMessage({ type: "success", text: "Profile saved successfully!" });
      fetchProfile();
    }

    setIsSaving(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()],
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((s) => s !== specialty),
    });
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !formData.service_areas.includes(newServiceArea.trim())) {
      setFormData({
        ...formData,
        service_areas: [...formData.service_areas, newServiceArea.trim()],
      });
      setNewServiceArea("");
    }
  };

  const removeServiceArea = (area: string) => {
    setFormData({
      ...formData,
      service_areas: formData.service_areas.filter((a) => a !== area),
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages_spoken.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages_spoken: [...formData.languages_spoken, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({
      ...formData,
      languages_spoken: formData.languages_spoken.filter((l) => l !== language),
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/specialist/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Specialist Profile
          </h1>
          <p className="text-xl text-text-secondary">
            Manage your professional information
          </p>
        </motion.div>

        {profile && (
          <motion.div
            variants={slideUp}
            className="card bg-white p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Verification Status
                </h3>
                <p className="text-text-secondary">
                  {profile.verification_status === "verified" ? (
                    <span className="inline-flex items-center gap-2 text-success-600">
                      <CheckCircle size={20} />
                      Verified Specialist
                    </span>
                  ) : profile.verification_status === "pending" ? (
                    <span className="inline-flex items-center gap-2 text-warning-600">
                      <AlertCircle size={20} />
                      Pending Verification
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-error-600">
                      <X size={20} />
                      Verification Rejected
                    </span>
                  )}
                </p>
              </div>
              {profile.rating_average > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-500">
                    {profile.rating_average.toFixed(1)} ⭐
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {profile.total_reviews} reviews
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

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
            <p className={`text-sm ${message.type === "success" ? "text-success-700" : "text-error-700"}`}>
              {message.text}
            </p>
          </motion.div>
        )}

        <motion.form
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          onSubmit={handleSave}
          className="space-y-8"
        >
          <motion.div variants={staggerItem} className="card bg-white p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Professional Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-text-primary mb-2">
                  Bio
                </label>
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell clients about your experience and expertise..."
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2">
                  Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="50.00"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="card bg-white p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Specialties
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                  placeholder="e.g., Windows Support, iPhone Help"
                />
                <Button type="button" onClick={addSpecialty} variant="secondary">
                  Add
                </Button>
              </div>
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty) => (
                    <motion.span
                      key={specialty}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="hover:text-primary-900"
                      >
                        <X size={16} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="card bg-white p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Service Areas
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addServiceArea())}
                  placeholder="e.g., New York, NY or Remote"
                />
                <Button type="button" onClick={addServiceArea} variant="secondary">
                  Add
                </Button>
              </div>
              {formData.service_areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.service_areas.map((area) => (
                    <motion.span
                      key={area}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-700 rounded-lg"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeServiceArea(area)}
                        className="hover:text-accent-900"
                      >
                        <X size={16} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="card bg-white p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Languages Spoken
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                  placeholder="e.g., English, Spanish"
                />
                <Button type="button" onClick={addLanguage} variant="secondary">
                  Add
                </Button>
              </div>
              {formData.languages_spoken.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.languages_spoken.map((language) => (
                    <motion.span
                      key={language}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-200 text-text-primary rounded-lg"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => removeLanguage(language)}
                        className="hover:text-text-primary"
                      >
                        <X size={16} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="flex justify-end gap-4">
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
              <Save size={20} className="mr-2" />
              Save Profile
            </Button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}

