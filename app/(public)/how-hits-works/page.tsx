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

const steps = [
  {
    step: "1",
    title: "Tell us what you need",
    description: "You tell us what you need help with (phone, tablet, computer, TV, Wi-Fi, scams, apps, and more).",
  },
  {
    step: "2",
    title: "Get matched",
    description: "We match you with a background checked, patient I.T. specialist.",
  },
  {
    step: "3",
    title: "Choose time & see cost",
    description: "You choose a time that works for you and see your visit cost upfront.",
  },
  {
    step: "4",
    title: "Get one-on-one help",
    description: "You receive one-on-one help in your home or remotely, plus a clear receipt after each visit.",
  },
  {
    step: "5",
    title: "Stay connected",
    description: "Access resources, schedule follow-ups, and get ongoing support through your HITS account.",
  },
];

const whatHITSDoes = [
  {
    title: "Remote Lessons & Support",
    description: "Video or phone sessions with patient specialists who walk through tasks at your pace.",
  },
  {
    title: "Library of On-Demand How-To Guides & Videos",
    description: "Hundreds of guides, live sessions, and printable checklists curated for older adults and caregivers.",
  },
  {
    title: "Group Lessons",
    description: "Interactive workshops on scams, online safety, and digital basics.",
  },
  {
    title: "In-Home Tech Support",
    description: "Patient, one-on-one help in your home for device setup, troubleshooting, and training.",
  },
  {
    title: "Device Setup & Configuration",
    description: "Help setting up new phones, tablets, computers, smart TVs, and other devices.",
  },
  {
    title: "Security & Safety Training",
    description: "Education on recognizing scams, creating strong passwords, and protecting your information.",
  },
];

export default function HowHITSWorksPage() {
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
            How HITS Works
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Simple, transparent, and designed with seniors and disabled adults in mind.
          </motion.p>
        </div>
      </section>

      {/* What HITS Does */}
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
            What HITS Does
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whatHITSDoes.map((item, idx) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.1}
                className="bg-white rounded-2xl border border-secondary-200 p-6 shadow-soft"
              >
                <h3 className="text-lg font-semibold text-primary-700 mb-2">{item.title}</h3>
                <p className="text-base text-text-secondary leading-6">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple 5-Step Process */}
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
            Simple 5-Step Process
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, idx) => (
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

      {/* For Seniors & Families */}
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
            For Seniors & Families
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="bg-white rounded-3xl border border-secondary-200 p-8 md:p-12 shadow-soft"
          >
            <p className="text-lg text-text-secondary leading-7 mb-4">
              HITS connects older adults, disabled adults, and caregivers with patient, vetted tech professionals for in-home and remote support. We focus on clear communication, fair pricing, and strong security so technology feels safe, not overwhelming.
            </p>
            <p className="text-lg text-text-secondary leading-7">
              With your HITS account, you can see upcoming visits, view visit history and receipts, update your contact information, send messages to your specialist, and rate your visits. We adjust our pace, communication style, and tools to match each person's needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* For Specialists */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-primary-700 text-center mb-8"
          >
            For Specialists
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="bg-secondary-50 rounded-3xl border border-secondary-200 p-8 md:p-12 shadow-soft"
          >
            <p className="text-lg text-text-secondary leading-7 mb-4">
              HITS specialists are independent contractors who provide patient, respectful tech support to seniors and disabled adults. As a specialist, you'll have access to:
            </p>
            <ul className="list-disc list-inside text-lg text-text-secondary leading-7 ml-4 space-y-2">
              <li>Flexible scheduling through your specialist dashboard</li>
              <li>Clear appointment details and client information</li>
              <li>Earnings tracking and payment history</li>
              <li>Resources and training materials</li>
              <li>Support from the HITS team</li>
            </ul>
            <div className="mt-6">
              <Link href="/register">
                <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                  Become a Specialist
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ready to Get Started */}
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

