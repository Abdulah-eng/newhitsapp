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
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const plans = [
  {
    name: "Starter",
    price: "$39",
    cadence: "Monthly",
    description: "For individuals getting started with remote tech support and guided learning.",
    features: [
      "1 live concierge session each month",
      "Unlimited access to Learning Library",
      "Security alerts & scam monitoring",
      "Quarterly device tune-ups",
    ],
  },
  {
    name: "Essentials",
    price: "$69",
    cadence: "Monthly",
    description: "Our most popular plan with priority scheduling and dedicated specialist pairing.",
    features: [
      "3 live concierge sessions each month",
      "Priority same-day scheduling",
      "Personal specialist pairing",
      "Progress tracking for caregivers",
    ],
    accent: true,
  },
  {
    name: "Family+",
    price: "$119",
    cadence: "Monthly",
    description: "Share support across the household with unlimited sessions and caregiver coordination.",
    features: [
      "Unlimited concierge sessions",
      "Shared family dashboard",
      "Caregiver coaching line",
      "Device coverage for 6 devices",
    ],
  },
];

const addOns = [
  { title: "In-home visit", detail: "Onsite setup and training in select metros.", price: "$149 / visit" },
  { title: "Device protection bundle", detail: "Managed antivirus, backups, and password vault.", price: "$12 / device" },
  { title: "Concierge white-label", detail: "For enterprises: branded portal and collateral.", price: "Custom" },
];

const comparisons = [
  { label: "Live concierge sessions", starter: "1 / mo", essentials: "3 / mo", family: "Unlimited" },
  { label: "Guided library access", starter: "✓", essentials: "✓", family: "✓" },
  { label: "Caregiver updates", starter: "Email summaries", essentials: "Portal tracker", family: "Portal + SMS" },
  { label: "Priority scheduling", starter: "Standard", essentials: "Same-day", family: "Instant routing" },
  { label: "Household members", starter: "1", essentials: "2", family: "5" },
];

export default function PlansPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fade}
            className="text-sm uppercase tracking-[0.35em] font-semibold text-primary-500"
          >
            Plans
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-[38px] md:text-[52px] font-extrabold leading-tight text-primary-900"
          >
            Flexible memberships for confident, secure technology use.
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary"
          >
            Choose the plan that fits your household, or work with us on enterprise concierge programs. Every plan comes
            with compassionate support from HITSapp specialists.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fade}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Start membership
              </Button>
            </Link>
            <Link href="/enterprise-services">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                Enterprise concierge
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-18 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fade}
              custom={idx}
              className={`rounded-3xl border bg-white p-8 shadow-soft ${
                plan.accent ? "border-primary-400 ring-4 ring-primary-100" : "border-secondary-200"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold">{plan.name}</p>
              <div className="mt-6 flex items-baseline justify-center gap-2">
                <p className="text-[42px] font-extrabold text-primary-700">{plan.price}</p>
                <p className="text-sm text-text-secondary">{plan.cadence}</p>
              </div>
              <p className="mt-3 text-base leading-7 text-text-secondary text-center">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-primary-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button
                    className={`w-full h-12 ${
                      plan.accent ? "bg-primary-500 hover:bg-primary-600" : "bg-secondary-200 text-primary-700 hover:bg-secondary-300"
                    }`}
                  >
                    Choose {plan.name}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[30px] md:text-[38px] font-bold text-center text-primary-700"
          >
            Add-ons & enterprise enhancements
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {addOns.map((addon, idx) => (
              <motion.div
                key={addon.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={idx * 0.1}
                className="rounded-3xl border border-secondary-200 bg-secondary-50 p-6 shadow-soft"
              >
                <h3 className="text-lg font-semibold text-primary-700">{addon.title}</h3>
                <p className="mt-3 text-base leading-7 text-text-secondary">{addon.detail}</p>
                <p className="mt-4 text-sm font-semibold text-primary-600">{addon.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-18 overflow-x-auto">
          <motion.table
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            className="w-full min-w-[720px] border-separate border-spacing-y-4"
          >
            <thead>
              <tr>
                <th className="text-left text-xs uppercase tracking-[0.3em] text-text-secondary">Feature</th>
                <th className="text-left text-xs uppercase tracking-[0.3em] text-text-secondary">Starter</th>
                <th className="text-left text-xs uppercase tracking-[0.3em] text-text-secondary">Essentials</th>
                <th className="text-left text-xs uppercase tracking-[0.3em] text-text-secondary">Family+</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, idx) => (
                <tr key={row.label} className="rounded-3xl bg-white shadow-soft">
                  <td className="rounded-l-3xl px-6 py-4 text-sm font-semibold text-primary-700">{row.label}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{row.starter}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{row.essentials}</td>
                  <td className="rounded-r-3xl px-6 py-4 text-sm text-text-secondary">{row.family}</td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[28px] md:text-[36px] font-bold text-primary-700"
          >
            Need help choosing the right plan?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-text-secondary"
          >
            We love co-planning. Set up a quick call and we’ll map the right mix of concierge sessions, workshops, and
            family tools for your goals.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.2}
            className="mt-6 flex flex-wrap justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Talk with an advisor
              </Button>
            </Link>
            <a href="tel:+16467586606">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                Call (646) 758-6606
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

