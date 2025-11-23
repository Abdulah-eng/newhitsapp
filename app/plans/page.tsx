"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const membershipPlans = [
  {
    name: "Connect Plan",
    price: "$25",
    cadence: "/ month",
    description: "For seniors and disabled adults who want a trusted tech helper on standby.",
    features: [
      "Member rate: $85/hour",
      "Priority scheduling on busy days",
      "Access to the HITS resource library (large-print guides and checklists)",
      "Email alerts with simple safety tips and scam warnings",
    ],
  },
  {
    name: "Comfort Plan",
    price: "$59",
    cadence: "/ month",
    description: "For seniors and disabled adults who expect regular help with their devices.",
    features: [
      "One 30-minute remote check-in included each month",
      "Member rate: $80/hour for additional in-home or remote visits",
      "Priority same-week scheduling",
      "Optional caregiver notifications for appointments and visit summaries",
    ],
    accent: true,
  },
  {
    name: "Family Care+ Plan",
    price: "$99",
    cadence: "/ month",
    description: "For families supporting one or more older adults or disabled adults.",
    features: [
      "One 60-minute visit included each month (in-home or remote, where available)",
      "Member rate: $75/hour for additional visits",
      "Covers up to 3 people in the same household or immediate family",
      "Family view of upcoming appointments and visit summaries",
      "Optional follow-up check-in after major tech changes (new phone, router, etc.)",
    ],
  },
];

export default function PlansPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fade}
            className="text-sm uppercase tracking-[0.35em] font-semibold text-primary-500"
          >
            Pricing & Plans
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-[38px] md:text-[52px] font-extrabold leading-tight text-primary-900"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary"
          >
            Choose pay-as-you-go visits or a membership plan that fits your needs. All pricing is upfront and transparent.
          </motion.p>
        </div>
      </section>

      {/* Pay-As-You-Go Section */}
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
            Simple, Transparent Visit Pricing
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-6 text-lg leading-8 text-text-secondary text-center max-w-3xl mx-auto"
          >
            We keep our pricing simple and honest.
          </motion.p>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.2}
            className="mt-10 rounded-3xl border border-secondary-200 bg-white p-8 md:p-12 shadow-soft max-w-3xl mx-auto"
          >
            <ul className="space-y-4 text-lg text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span><strong className="text-primary-700">$95</strong> for the first hour of one-on-one help</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span><strong className="text-primary-700">$45</strong> for each additional 30 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span><strong className="text-primary-700">1-hour minimum</strong> for in-home visits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span><strong className="text-primary-700">30-minute minimum</strong> for remote support</span>
              </li>
            </ul>
            <p className="mt-8 text-base text-text-secondary leading-7">
              After the first hour, the rate drops to $45 per 30 minutes (a $5 savings compared to the first hour). You always see the estimated cost of your visit, including any travel fee, before you confirm your appointment. You'll receive a clear receipt after every session.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Membership Plans Section */}
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
            Memberships for Ongoing Peace of Mind
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-text-secondary text-center max-w-3xl mx-auto"
          >
            Our memberships are designed for real life: quick questions, regular check-ins, and families who never want their loved ones to feel "stuck" with technology.
          </motion.p>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {membershipPlans.map((plan, idx) => (
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
                      <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/senior/membership">
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

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.3}
            className="mt-8 text-sm text-text-secondary text-center italic"
          >
            Memberships can be adjusted or canceled. Any already scheduled appointments are honored according to the plan that was active when they were booked.
          </motion.p>
        </div>
      </section>

      {/* Travel Area & Mileage Section */}
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
            Travel Area & Mileage
          </motion.h2>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-10 rounded-3xl border border-secondary-200 bg-white p-8 md:p-12 shadow-soft"
          >
            <p className="text-lg text-text-secondary mb-6">
              <strong className="text-primary-700">HITS is based in Hope Mills, NC 28348.</strong>
            </p>
            
            <ul className="space-y-4 text-base text-text-secondary mb-8">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span>Up to <strong className="text-primary-700">20 driving miles</strong> from our Hope Mills headquarters are included in the visit price.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span>If a client lives farther than 20 miles away, a <strong className="text-primary-700">$1.00 per mile travel fee</strong> is added for each mile beyond 20, based on round-trip driving distance.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span>The estimated travel fee is calculated and shown before the appointment is confirmed.</span>
              </li>
            </ul>

            <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-200">
              <p className="text-sm font-semibold text-primary-700 mb-3">Example:</p>
              <p className="text-base text-text-secondary leading-7">
                If a client lives 32 miles away from Hope Mills, the first 20 miles are included. The extra 12 miles are charged as travel: <strong className="text-primary-700">12 miles × $1.00 = $12 travel fee</strong>, added to the visit total.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-text-secondary"
          >
            Book a visit or choose a membership plan that works for you.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.2}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Book a Visit
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                Contact Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
