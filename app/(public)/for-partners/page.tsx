"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const programTypes = [
  {
    title: "On-site tech days",
    description: "For residents and members",
  },
  {
    title: "Remote tech concierge support",
    description: "Ongoing assistance for your community",
  },
  {
    title: "Workshops",
    description: "On scams, online safety, and digital basics",
  },
  {
    title: "Family and caregiver support sessions",
    description: "Help families support their loved ones",
  },
  {
    title: "Custom programs",
    description: "For specific populations (e.g., veterans, low-vision clients, disabled adults)",
  },
];

const partnerBenefits = [
  "Reduce staff time spent on tech troubleshooting",
  "Improve satisfaction with digital services (portals, apps, devices)",
  "Support safe use of online health and financial tools",
  "Demonstrate added value and care to residents, members, and families",
];

const platformFeatures = [
  "Admin-level dashboard to view appointments, usage, and trends",
  "Activity logs and security monitoring for transparency",
  "Dispute and payment overview",
  "Configurable settings to match partner policies and programs",
];

export default function ForPartnersPage() {
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
            Tech support that extends your team not your workload.
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            HITS partners with senior communities, disability organizations, clinics, churches, libraries, and other groups to provide patient, high-quality tech support to the people you serve.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fade}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/contact">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Request a Partnership Call
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
              Download Partner Overview
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Program Types */}
      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center"
          >
            Program Types
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programTypes.map((program, idx) => (
              <motion.div
                key={program.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.1}
                className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-soft"
              >
                <h3 className="text-lg font-semibold text-primary-700 mb-2">{program.title}</h3>
                <p className="text-base text-text-secondary">{program.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits to Partners */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center"
          >
            Benefits to Partners
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-10 rounded-3xl border border-secondary-200 bg-secondary-50 p-8 md:p-12 shadow-soft"
          >
            <ul className="space-y-4">
              {partnerBenefits.map((benefit, idx) => (
                <motion.li
                  key={benefit}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fade}
                  custom={idx * 0.05}
                  className="flex items-start gap-3 text-base text-text-secondary"
                >
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center"
          >
            Platform Features for Partners
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-10 rounded-3xl border border-secondary-200 bg-white p-8 md:p-12 shadow-soft"
          >
            <ul className="space-y-4">
              {platformFeatures.map((feature, idx) => (
                <motion.li
                  key={feature}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fade}
                  custom={idx * 0.05}
                  className="flex items-start gap-3 text-base text-text-secondary"
                >
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
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
            Ready to Partner with HITS?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Let's discuss how HITS can support your community.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.2}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/contact">
              <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                Request a Partnership Call
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
              Download Partner Overview
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

