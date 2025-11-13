"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";
import { ChevronDown } from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const faqs = [
  {
    question: "How far will a HITS technician travel?",
    answer: (
      <>
        Our technicians start from our headquarters in Hope Mills, NC 28348. Up to 20 driving miles are included in the cost of your visit. If you live farther than 20 miles away, we add a $1.00 per mile travel fee for each mile beyond 20, based on round-trip driving distance. The travel fee is calculated and displayed before you confirm your appointment.
      </>
    ),
  },
  {
    question: "What kinds of tech help does HITS provide?",
    answer: (
      <>
        HITS provides technology education, setup, and troubleshooting for everyday devices; like phones, tablets, computers, printers, smart TVs, Wi-Fi, and common apps. We help with email, video calls, online accounts, device setup, and scam and safety issues. We welcome seniors and disabled adults of any age, and we adjust our pace, communication style, and tools to match each person's needs.
        <br /><br />
        HITS does not perform hardware repair that requires opening devices or soldering, and we do not provide medical, legal, or financial advice.
      </>
    ),
  },
  {
    question: "What happens if something goes wrong with my data?",
    answer: (
      <>
        We handle information with care and follow strong security practices. However, no digital work is completely risk-free. Clients are strongly encouraged to keep their own backups before any major changes. HITS cannot be responsible for data that was already damaged, corrupted, or not backed up before a visit.
      </>
    ),
  },
  {
    question: "What if I think I've been scammed or hacked?",
    answer: (
      <>
        HITS is not an emergency service. If you suspect fraud, theft, or any criminal activity, contact your bank and local law enforcement right away. After you are safe, HITS can help secure your devices and accounts, update passwords, and add extra safety protections.
      </>
    ),
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Find answers to common questions about HITS services, pricing, and how we work.
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary-100">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fade}
                custom={index * 0.1}
                className="rounded-2xl border border-secondary-200 bg-white shadow-soft overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-secondary-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-primary-700 pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`flex-shrink-0 text-primary-600 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    size={24}
                  />
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-base leading-7 text-text-secondary">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
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
            Still have questions?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0.1}
            className="mt-4 text-lg leading-8 text-text-secondary"
          >
            We're here to help. Contact our support team for personalized assistance.
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
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Contact Support
              </Button>
            </Link>
            <Link href="/senior/book-appointment">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                Book a Visit
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

