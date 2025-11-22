"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const helpItems = [
  "Setting up new phones, tablets, computers, and smart TVs",
  "Fixing Wi-Fi and printer issues",
  "Email, passwords, and account recovery",
  "Video calls with children, grandchildren, and doctors",
  "Telehealth portals and online appointments",
  "Scam and fraud safety checks",
  "Organizing photos, files, and cloud storage",
  "Basic training on everyday apps and websites",
];

const visitSteps = [
  {
    step: "1",
    title: "Share what you need",
    description: "You share what you need help with and where you're located.",
  },
  {
    step: "2",
    title: "Pick a time",
    description: "You pick a time that works for you.",
  },
  {
    step: "3",
    title: "See the cost upfront",
    description: "You see the visit cost and any travel fee upfront.",
  },
  {
    step: "4",
    title: "Get one-on-one help",
    description: "Your specialist arrives, listens first, and works at your pace.",
  },
  {
    step: "5",
    title: "Receive summary",
    description: "You receive a simple summary and a clear receipt after your visit.",
  },
];

const dashboardFeatures = [
  "See upcoming visits and appointment details",
  "View your visit history and receipts",
  "Update your contact information and preferences",
  "Send messages to your specialist or support",
  "Rate your visits and share feedback",
];

export default function ForSeniorsFamiliesPage() {
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
            Friendly tech help, on your terms.
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Whether it's a phone that won't cooperate, a TV that lost its signal, or an online account you can't get into, HITS sends a patient tech specialist to help you step by step at home or remotely.
          </motion.p>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fade}
            className="mt-4 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            We support seniors and disabled adults, along with the caregivers and families who stand beside them.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fade}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/senior/book-appointment">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Book a Visit
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                View Plans
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What We Help With */}
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
            What We Help With
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {helpItems.map((item, idx) => (
              <motion.div
                key={item}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.05}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-secondary-200"
              >
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span className="text-base text-text-secondary">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How a Visit Works */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center"
          >
            How a Visit Works
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
            {visitSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.1}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-primary-700 mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-6">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Senior/Client Account */}
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
            Senior / Client Account (Dashboard Overview)
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-6 text-lg leading-8 text-text-secondary text-center"
          >
            With your HITS account, you can:
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.2}
            className="mt-10 rounded-3xl border border-secondary-200 bg-white p-8 md:p-12 shadow-soft max-w-3xl mx-auto"
          >
            <ul className="space-y-4">
              {dashboardFeatures.map((feature, idx) => (
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

      {/* Safety, Respect & Accessibility */}
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
            Safety, Respect & Accessibility
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-10 rounded-3xl border border-secondary-200 bg-secondary-50 p-8 md:p-12 shadow-soft"
          >
            <p className="text-lg leading-8 text-text-secondary">
              We take extra care with our senior and disabled clients. Our specialists are trained to slow down, explain each step, and always ask before making changes. We never pressure clients into buying extra products or services they don't need, and we adjust our pace, communication, and tools to match each person's needs.
            </p>
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
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Book your first visit or learn more about our membership plans.
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
            <Link href="/plans">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                View Plans
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

