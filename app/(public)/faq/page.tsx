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
    question: "What is HITS – Hire I.T. Specialist?",
    answer: (
      <>
        HITS is a tech support service designed especially for seniors, disabled adults, and the families who care for them. We connect you with patient, background checked I.T. specialists for in-home or remote help with your devices.
      </>
    ),
  },
  {
    question: "Who is HITS for?",
    answer: (
      <>
        HITS is for:
        <br /><br />
        • Seniors living alone or with family
        <br />
        • Disabled adults and people with accessibility needs
        <br />
        • Adult children and caregivers supporting loved ones
        <br />
        • Families who want a trusted "tech person" they can call
        <br />
        • Community partners who serve older adults and need extra tech support
      </>
    ),
  },
  {
    question: "What kinds of problems can you help with?",
    answer: (
      <>
        Examples include:
        <br /><br />
        • Setting up new phones, tablets, computers, or smart TVs
        <br />
        • Wi-Fi and internet issues
        <br />
        • Email, passwords, and account recovery
        <br />
        • Telehealth portals and online appointments
        <br />
        • Online safety, scams, and fraud concerns
        <br />
        • Video calls with family, friends, and doctors
        <br />
        • Organizing photos, files, and cloud storage
        <br />
        • Learning everyday apps and websites
        <br /><br />
        If you're not sure whether we can help, you can still contact us. We'll let you know.
      </>
    ),
  },
  {
    question: "Do I have to be \"good with technology\" to use HITS?",
    answer: (
      <>
        No. HITS is built for people who are not comfortable with technology. You can describe your problem in plain language. Your specialist will go step by step, at your pace.
      </>
    ),
  },
  {
    question: "Do you offer remote help, in-home help, or both?",
    answer: (
      <>
        Both, when available in your area.
        <br /><br />
        • Remote help is done by phone or online.
        <br />
        • In-home help is when a specialist visits your home at a scheduled time.
        <br /><br />
        You can choose what works best for you when you book.
      </>
    ),
  },
  {
    question: "What is the 'Member Support (Remote Help)' link?",
    answer: (
      <>
        The Member Support link provides access to our secure remote support tool (CanDoo ScreenConnect). This tool allows HITS members to receive real-time technical assistance from our specialists directly on their computer or device.
        <br /><br />
        <strong>How it works:</strong>
        <br />
        • Click the "Member Support (Remote Help)" link in the footer
        <br />
        • You'll be connected to our secure remote support portal
        <br />
        • A HITS specialist can then help you with your device remotely, with your permission
        <br /><br />
        This service is available to HITS members and is used for scheduled remote support sessions. If you need immediate help, please contact us at{" "}
        <a href="mailto:support@hitsapp.com" className="text-primary-600 hover:text-primary-700">support@hitsapp.com</a> or call{" "}
        <a href="tel:6467586606" className="text-primary-600 hover:text-primary-700">(646) 758-6606</a>.
      </>
    ),
  },
  {
    question: "How does pricing work?",
    answer: (
      <>
        We keep pricing clear and simple:
        <br /><br />
        • A flat rate for the first hour of one-on-one help
        <br />
        • A clear rate for each additional 30 minutes
        <br />
        • A minimum time for in-home and remote sessions
        <br />
        • A travel fee only if you live more than 20 driving miles from our base location
        <br /><br />
        You'll always see the estimated cost before you confirm your appointment.
      </>
    ),
  },
  {
    question: "What is the travel fee?",
    answer: (
      <>
        We include up to 20 driving miles from our Hope Mills, NC headquarters.
        <br /><br />
        If your home is farther than 20 miles away, there is a $1.00 per mile travel fee for each mile beyond 20, based on round-trip driving distance.
        <br /><br />
        The exact fee is shown when you book, so there are no surprises.
      </>
    ),
  },
  {
    question: "Do I have to buy a membership?",
    answer: (
      <>
        No. You can:
        <br /><br />
        • Book a one-time visit, or
        <br />
        • Choose a monthly membership if you want regular check-ins and priority scheduling.
        <br /><br />
        Memberships include extra benefits, such as quick questions, monthly remote check-ins, or family access. You can change or cancel your plan according to the membership terms.
      </>
    ),
  },
  {
    question: "How are specialists screened?",
    answer: (
      <>
        Every HITS specialist:
        <br /><br />
        • Completes an application and vetting process
        <br />
        • Passes a background check
        <br />
        • Agrees to our code of conduct, which includes:
        <br />
        &nbsp;&nbsp;o Treating every client with respect
        <br />
        &nbsp;&nbsp;o Using clear, plain language
        <br />
        &nbsp;&nbsp;o Asking permission before making changes
        <br />
        &nbsp;&nbsp;o Never pressuring clients to buy extra products or services
        <br /><br />
        If something doesn't feel right, you can contact support at any time.
      </>
    ),
  },
  {
    question: "Will a specialist need my passwords?",
    answer: (
      <>
        No. We never ask you to send passwords through email, text, or chat.
        <br /><br />
        Sometimes a specialist may need you to type your password yourself on your device to log in. You should never share your passwords out loud, on paper, or in messages.
        <br /><br />
        If anyone claiming to be from HITS asks for your password directly, please end the conversation and contact support immediately.
      </>
    ),
  },
  {
    question: "What devices do you support?",
    answer: (
      <>
        We can usually help with:
        <br /><br />
        • Windows and Mac computers
        <br />
        • iPhones and Android phones
        <br />
        • iPads and tablets
        <br />
        • Wi-Fi routers and modems
        <br />
        • Printers
        <br />
        • Smart TVs and streaming devices
        <br />
        • Common smart-home devices
        <br /><br />
        If you have a different device, tell us what it is. If we can't support it safely, we'll say so.
      </>
    ),
  },
  {
    question: "Can family members or caregivers be involved?",
    answer: (
      <>
        Yes. We encourage families and caregivers to be part of the process.
        <br /><br />
        • You can create an account as a Caregiver / Family Member and book on behalf of someone else.
        <br />
        • You can be present during visits and receive visit summaries, with your loved one's permission.
      </>
    ),
  },
  {
    question: "How do I reschedule or cancel an appointment?",
    answer: (
      <>
        You can:
        <br /><br />
        • Log in to your HITS account and go to My Appointments, or
        <br />
        • Contact support during business hours.
        <br /><br />
        Please review our cancellation policy for any time-based fees. We will always try to work with you if something urgent comes up.
      </>
    ),
  },
  {
    question: "Is HITS an emergency service?",
    answer: (
      <>
        No. HITS is not an emergency or 911 service.
        <br /><br />
        If you or someone nearby is in danger, has a medical emergency, or is experiencing financial fraud in real time, contact 911 or your local authorities first.
        <br /><br />
        We can help with follow-up tech concerns after the situation is safe.
      </>
    ),
  },
  {
    question: "Do you sell computers, phones, or other products?",
    answer: (
      <>
        No. HITS focuses on service and support, not selling devices.
        <br /><br />
        We can give you general advice about what to look for, but we do not earn commissions from selling specific brands or models. This helps us stay focused on what's best for you.
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

      {/* Emergency Disclaimer */}
      <section className="bg-error-50 border-b border-error-200">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="bg-white rounded-2xl border-2 border-error-300 p-8 shadow-soft"
          >
            <h2 className="text-2xl font-bold text-error-700 mb-4">Emergency Disclaimer</h2>
            <p className="text-base leading-7 text-text-secondary">
              HITS – Hire I.T. Specialist is not a 911 or emergency service and does not provide medical, mental health, or crisis response. If you or someone near you is in immediate danger, experiencing a medical emergency, or facing active fraud, call 911, your local authorities, or your bank right away.
            </p>
          </motion.div>
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
                    <div className="text-base leading-7 text-text-secondary">{faq.answer}</div>
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
