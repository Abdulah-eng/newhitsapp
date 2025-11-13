"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-secondary-100">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="bg-white rounded-3xl border border-secondary-200 p-8 md:p-12 shadow-soft space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Introduction</h2>
              <p className="text-text-secondary leading-7">
                HITS – Hire I.T. Specialist ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Information We Collect</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Personal Information</h3>
                  <p>We collect information that you provide directly to us, including:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Billing and payment information (processed securely through Stripe)</li>
                    <li>Service address and location information</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Usage Information</h3>
                  <p>We automatically collect certain information when you use our services:</p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Pages visited and time spent on our platform</li>
                    <li>Appointment history and service requests</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">How We Use Your Information</h2>
              <p className="text-text-secondary leading-7 mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process appointments and facilitate communication between clients and specialists</li>
                <li>Process payments and manage memberships</li>
                <li>Send service-related communications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze usage patterns to improve our platform</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Information Sharing</h2>
              <p className="text-text-secondary leading-7 mb-3">We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li><strong>With Service Providers:</strong> We share information with trusted third-party service providers (such as Stripe for payments) who assist us in operating our platform</li>
                <li><strong>With Specialists:</strong> When you book an appointment, we share necessary information (name, contact details, service address) with the assigned specialist</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, your information may be transferred</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Data Security</h2>
              <p className="text-text-secondary leading-7">
                We implement appropriate technical and organizational measures to protect your personal information. This includes encryption, secure payment processing, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Your Rights</h2>
              <p className="text-text-secondary leading-7 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Access and review your personal information</li>
                <li>Update or correct your information through your account settings</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Cookies and Tracking</h2>
              <p className="text-text-secondary leading-7">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist with security. You can control cookies through your browser settings, though this may affect some platform functionality.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Children's Privacy</h2>
              <p className="text-text-secondary leading-7">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Changes to This Policy</h2>
              <p className="text-text-secondary leading-7">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Contact Us</h2>
              <p className="text-text-secondary leading-7">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <p className="text-text-primary font-medium">HITS – Hire I.T. Specialist</p>
                <p className="text-text-secondary">Email: support@hitsapp.com</p>
                <p className="text-text-secondary">Phone: (646) 758-6606</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

