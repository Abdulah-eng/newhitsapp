"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMembership } from "@/lib/hooks/useMembership";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { FileText, Video, Users, Mail, Lock, CheckCircle, Crown, Download, AlertCircle } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  access_level: "free" | "members_only";
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ResourcesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { membership, hasActiveMembership } = useMembership(user?.id);
  const supabase = createSupabaseBrowserClient();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && user.role !== "senior") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchResources();
    }
  }, [user, authLoading, hasActiveMembership]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from("resources")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // If user doesn't have active membership, only show free resources
      if (!hasActiveMembership) {
        query = query.eq("access_level", "free");
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setResources(data || []);
    } catch (err: any) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return FileText;
    const type = fileType.toLowerCase();
    if (type === "pdf") return FileText;
    if (["doc", "docx"].includes(type)) return FileText;
    if (["ppt", "pptx"].includes(type)) return FileText;
    if (["xls", "xlsx"].includes(type)) return FileText;
    return FileText;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="mb-6">
          <Link
            href="/senior/dashboard"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Resource Library</h1>
          <p className="text-text-secondary mt-2">
            Access guides, checklists, and resources to stay confident online
          </p>
        </div>

        {/* Membership Status Banner */}
        {hasActiveMembership && membership?.membership_plan ? (
          <motion.div
            variants={slideUp}
            className="mb-8 p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown size={24} />
              <h2 className="text-xl font-bold">
                {membership.membership_plan.name} Member
              </h2>
            </div>
            <p className="text-white/90">
              You have access to all {membership.membership_plan.name} resources and benefits.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={slideUp}
            className="mb-8 p-6 bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Lock size={24} className="text-text-tertiary" />
              <h2 className="text-lg font-semibold text-text-primary">
                Limited Access
              </h2>
            </div>
            <p className="text-text-secondary mb-4">
              Upgrade to a membership plan to unlock exclusive resources, guides, and workshops.
            </p>
            <Link href="/senior/membership">
              <Button variant="primary" size="sm">
                View Membership Plans
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            variants={slideUp}
            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="text-error-600" size={20} />
            <span className="text-error-700">{error}</span>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : resources.length === 0 ? (
          <motion.div
            variants={slideUp}
            className="text-center py-12 bg-white rounded-lg border border-secondary-200"
          >
            <FileText size={48} className="mx-auto text-text-tertiary mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Resources Available
            </h3>
            <p className="text-text-secondary">
              {!hasActiveMembership
                ? "Check back soon for free resources, or upgrade to a membership for exclusive content."
                : "Resources will appear here once they are uploaded."}
            </p>
          </motion.div>
        ) : (
          /* Resources Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, idx) => {
              const Icon = getFileIcon(resource.file_type);
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card bg-white p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <Icon className="text-primary-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-2">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-text-secondary mb-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-text-secondary flex-wrap">
                        <span className="uppercase text-xs">
                          {resource.file_type || "File"}
                        </span>
                        {resource.file_size && (
                          <span>• {formatFileSize(resource.file_size)}</span>
                        )}
                        {resource.access_level === "free" ? (
                          <span className="px-2 py-0.5 bg-success-50 text-success-600 rounded text-xs">
                            Free
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs">
                            Members Only
                          </span>
                        )}
                        {resource.category && (
                          <span className="px-2 py-0.5 bg-secondary-100 text-text-secondary rounded text-xs">
                            {resource.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download size={16} className="mr-2" />
                        Download {resource.file_type?.toUpperCase() || "File"}
                      </Button>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Member-Only Resources Locked */}
        {!hasActiveMembership && (
          <motion.div
            variants={slideUp}
            className="mt-8 p-6 bg-secondary-50 border border-secondary-200 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-text-tertiary" size={24} />
              <h2 className="text-lg font-semibold text-text-primary">
                Member-Only Resources
              </h2>
            </div>
            <p className="text-text-secondary mb-4">
              Unlock additional resources, guides, and exclusive content with a membership plan.
            </p>
            <div className="mt-6 text-center">
              <Link href="/senior/membership">
                <Button variant="primary">
                  Unlock with Membership
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Benefits Section */}
        {hasActiveMembership && membership?.membership_plan && (
          <motion.div
            variants={slideUp}
            className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg"
          >
            <h2 className="text-lg font-semibold text-primary-700 mb-4">
              Your Membership Benefits
            </h2>
            <ul className="space-y-2">
              {membership.membership_plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="text-primary-500 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

