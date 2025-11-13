"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";
import { useAuth } from "@/lib/hooks/useAuth";

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
      "Recognizing email scams",
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
    type: "Short how-to videos",
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

export default function ResourcesPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />

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

      {/* CTA Section */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[28px] md:text-[36px] font-bold"
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

