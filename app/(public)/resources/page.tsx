"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMembership } from "@/lib/hooks/useMembership";
import { Download, FileText, Lock } from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const categories = [
  {
    title: "Getting Started",
    description: "Phone, tablet, computer basics",
    resources: [
      "Setting up your first smartphone",
      "Understanding your tablet",
      "Computer basics for beginners",
      "Connecting to Wi-Fi",
    ],
  },
  {
    title: "Safety & Scams",
    description: "Passwords, fraud, safe browsing",
    resources: [
      "How to create strong passwords",
      "How to spot fake emails and text messages.",
      "Safe online shopping",
      "Protecting your personal information",
    ],
  },
  {
    title: "Daily Life Online",
    description: "Telehealth, grocery delivery, rideshare, banking",
    resources: [
      "Using telehealth portals",
      "Ordering groceries online",
      "Rideshare apps for seniors",
      "Online banking basics",
    ],
  },
  {
    title: "HITS Help Sheets",
    description: "Printable checklists seniors and disabled adults can keep near their devices",
    resources: [
      "Quick reference: Video calls",
      "Quick reference: Email basics",
      "Quick reference: Password reset",
      "Quick reference: Wi-Fi troubleshooting",
    ],
  },
];

const resourceTypes = [
  {
    type: "Large-print PDF guides",
    description: "Step-by-step guides with large, easy-to-read text",
    icon: "📄",
  },
  {
    type: "Short step-by-step videos you can pause and rewatch.",
    description: "Visual tutorials you can watch at your own pace",
    icon: "🎥",
  },
  {
    type: "Live or virtual workshops",
    description: "Interactive sessions with HITS specialists",
    icon: "👥",
  },
  {
    type: "Weekly Tech Tip newsletter",
    description: "Simple tips delivered to your email",
    icon: "📧",
  },
];

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  access_level: "free" | "members_only";
  category: string | null;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { hasActiveMembership } = useMembership(user?.id);
  const supabase = createSupabaseBrowserClient();
  const [downloadableResources, setDownloadableResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [user, hasActiveMembership]);

  const fetchResources = async () => {
    try {
      let query = supabase
        .from("resources")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // If user is logged in and has membership, show all resources
      // Otherwise, only show free resources
      if (!isLoggedIn || !hasActiveMembership) {
        query = query.eq("access_level", "free");
      }

      const { data, error } = await query;

      if (error) throw error;
      setDownloadableResources(data || []);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoadingResources(false);
    }
  };

  return (
    <main className="bg-secondary-50 text-text-primary">

      {/* Hero Section */}
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fade}
            className="text-[38px] md:text-[52px] font-extrabold leading-tight text-primary-900"
          >
            Resources
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Guides, checklists, and workshops to stay confident online.
          </motion.p>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fade}
            className="mt-4 text-base leading-7 text-text-secondary max-w-3xl mx-auto"
          >
            Our resources are written in plain language, with large print options and step-by-step screenshots whenever possible.
          </motion.p>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="bg-secondary-100">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center mb-12"
          >
            Resource Categories
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={category.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.1}
                className="bg-white rounded-2xl border border-secondary-200 p-8 shadow-soft"
              >
                <h3 className="text-2xl font-semibold text-primary-700 mb-2">{category.title}</h3>
                <p className="text-base text-text-secondary mb-6">{category.description}</p>
                <ul className="space-y-3">
                  {category.resources.map((resource, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                      <span className="text-base text-text-secondary">{resource}</span>
                    </li>
                  ))}
                </ul>
                {!isLoggedIn && category.title === "HITS Help Sheets" && (
                  <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                    <p className="text-sm text-text-secondary">
                      <Link href="/register" className="text-primary-600 hover:text-primary-500 font-semibold">
                        Sign up
                      </Link>{" "}
                      to access all HITS Help Sheets and member resources.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Types */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center mb-12"
          >
            Types of Resources
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceTypes.map((item, idx) => (
              <motion.div
                key={item.type}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.1}
                className="bg-secondary-50 rounded-xl border border-secondary-200 p-6 shadow-soft text-center"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-primary-700 mb-2">{item.type}</h3>
                <p className="text-sm text-text-secondary leading-6">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Model */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center mb-8"
          >
            Access Model
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="bg-white rounded-3xl border border-secondary-200 p-8 md:p-12 shadow-soft"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <p className="text-base text-text-secondary leading-7">
                  <strong className="text-primary-700">Some resources are available to everyone</strong> without an account.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <p className="text-base text-text-secondary leading-7">
                  <strong className="text-primary-700">Additional guides, workshop replays, and tools</strong> can be made available to logged-in members and/or specific membership tiers.
                </p>
              </div>
            </div>
            {!isLoggedIn && (
              <div className="mt-8 pt-8 border-t border-secondary-200 text-center">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                    Sign Up for Full Access
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Resource Downloads Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center mb-12"
          >
            Downloadable Resources
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="bg-secondary-50 rounded-3xl border border-secondary-200 p-8 md:p-12 shadow-soft"
          >
            <p className="text-lg text-text-secondary leading-7 text-center mb-8">
              Download large-print PDFs, tip sheets, guides, and checklists to keep near your devices.
            </p>
            {isLoadingResources ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : downloadableResources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">Resources will appear here once uploaded by the admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {downloadableResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fade}
                    custom={0}
                    className="bg-white rounded-xl border border-secondary-200 p-6 shadow-soft hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-primary-700 mb-1">{resource.title}</h3>
                          {resource.access_level === "members_only" && (
                            <Lock size={16} className="text-primary-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        {resource.description && (
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-text-tertiary">
                            {resource.file_size ? `${(resource.file_size / 1024).toFixed(2)} KB` : ""}
                            {resource.category && ` • ${resource.category}`}
                          </span>
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            <Download size={16} />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {!isLoggedIn && (
              <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200 text-center">
                <p className="text-sm text-text-secondary mb-2">
                  Some resources are available only to members.
                </p>
                <Link href="/register">
                  <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                    Sign Up for Full Access
                  </Button>
                </Link>
              </div>
            )}
            {isLoggedIn && !hasActiveMembership && (
              <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200 text-center">
                <p className="text-sm text-text-secondary mb-2">
                  Upgrade to a membership plan to access all resources.
                </p>
                <Link href="/plans">
                  <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                    View Membership Plans
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[28px] md:text-[36px] font-bold text-white"
          >
            Need More Help?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Our specialists are here to help you one-on-one with any tech questions.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.2}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/senior/book-appointment">
              <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                Book a Visit
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                Contact Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

