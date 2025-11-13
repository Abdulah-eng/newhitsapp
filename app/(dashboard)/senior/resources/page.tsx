"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMembership } from "@/lib/hooks/useMembership";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { FileText, Video, Users, Mail, Lock, CheckCircle, Crown } from "lucide-react";

const memberResources = {
  connect: [
    { type: "pdf", title: "Quick Reference: Video Calls", icon: FileText },
    { type: "pdf", title: "Quick Reference: Email Basics", icon: FileText },
    { type: "pdf", title: "Quick Reference: Password Reset", icon: FileText },
    { type: "pdf", title: "Quick Reference: Wi-Fi Troubleshooting", icon: FileText },
  ],
  comfort: [
    { type: "pdf", title: "All Connect Plan Resources", icon: FileText },
    { type: "video", title: "Setting Up Your First Smartphone", icon: Video },
    { type: "pdf", title: "Safe Online Shopping Guide", icon: FileText },
    { type: "pdf", title: "Telehealth Portal Setup", icon: FileText },
  ],
  family_care_plus: [
    { type: "pdf", title: "All Comfort Plan Resources", icon: FileText },
    { type: "video", title: "Family Tech Support Workshop", icon: Video },
    { type: "pdf", title: "Caregiver Tech Guide", icon: FileText },
    { type: "workshop", title: "Monthly Tech Tips Newsletter Archive", icon: Mail },
  ],
};

const publicResources = [
  { type: "pdf", title: "Getting Started with HITS", icon: FileText, public: true },
  { type: "pdf", title: "Basic Safety Tips", icon: FileText, public: true },
];

export default function ResourcesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { membership, hasActiveMembership } = useMembership(user?.id);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && user.role !== "senior") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (hasActiveMembership && membership?.membership_plan) {
      const planType = membership.membership_plan.plan_type;
      const memberRes = memberResources[planType] || [];
      setResources([...publicResources, ...memberRes]);
    } else {
      setResources(publicResources);
    }
  }, [hasActiveMembership, membership]);

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

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={idx}
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
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      {resource.type === "pdf" && <span>PDF Guide</span>}
                      {resource.type === "video" && <span>Video Tutorial</span>}
                      {resource.type === "workshop" && <span>Workshop</span>}
                      {resource.public && (
                        <span className="px-2 py-0.5 bg-success-50 text-success-600 rounded text-xs">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // In production, this would link to actual resource files
                      alert("Resource download coming soon! This will link to the actual resource file.");
                    }}
                  >
                    {resource.type === "pdf" && "Download PDF"}
                    {resource.type === "video" && "Watch Video"}
                    {resource.type === "workshop" && "View Archive"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

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
              Unlock additional resources, video tutorials, and workshop archives with a membership plan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
              {memberResources.comfort.slice(0, 3).map((resource, idx) => {
                const Icon = resource.icon;
                return (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-secondary-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="text-text-tertiary" size={20} />
                      <span className="text-sm font-medium text-text-tertiary">
                        {resource.title}
                      </span>
                    </div>
                    <Lock className="text-text-tertiary" size={16} />
                  </div>
                );
              })}
            </div>
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

