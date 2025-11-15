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

export default function TermsOfServicePage() {
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
            Terms of Service
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Agreement to Terms</h2>
              <p className="text-text-secondary leading-7">
                By accessing or using HITS – Hire I.T. Specialist ("HITS," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Description of Services</h2>
              <p className="text-text-secondary leading-7 mb-3">
                HITS connects seniors, disabled adults, and families with vetted I.T. specialists for in-home and remote technology support. Our services include:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Device setup and troubleshooting (phones, tablets, computers, smart TVs)</li>
                <li>Wi-Fi, router, and printer support</li>
                <li>Email and online account assistance</li>
                <li>Video call setup and training</li>
                <li>Scam and fraud safety checks</li>
                <li>Basic technology training</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                <strong>HITS does not provide:</strong> Hardware repairs requiring device disassembly, medical advice, legal advice, or financial advice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">User Accounts</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <p>To use certain features of our platform, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as necessary</li>
                  <li>Keep your account credentials secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Pricing and Payments</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Pay-As-You-Go Visits</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>$95 for the first hour of service</li>
                    <li>$45 for each additional 30 minutes</li>
                    <li>1-hour minimum for in-home visits</li>
                    <li>30-minute minimum for remote support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Membership Plans</h3>
                  <p>Membership plans are billed monthly and automatically renew unless cancelled. You may cancel your membership at any time, and it will remain active until the end of your current billing period.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Travel Fees</h3>
                  <p>For in-home visits beyond 20 miles from Hope Mills, NC 28348, a travel fee of $1.00 per mile (round-trip) applies. Travel fees are calculated and displayed before appointment confirmation.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Payment Processing</h3>
                  <p>All payments are processed securely through Stripe. We do not store your full payment card information on our servers.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Appointments and Cancellations</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <p>Appointments must be scheduled in advance through our platform. You may cancel appointments according to the following:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Cancellations made at least 24 hours in advance: Full refund</li>
                  <li>Cancellations made less than 24 hours in advance: Refund minus a cancellation fee</li>
                  <li>No-shows: No refund</li>
                  <li>Specialist cancellations: Full refund or rescheduling option</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Service Limitations</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <p>While we strive to provide excellent service, we cannot guarantee:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>That all technical issues can be resolved</li>
                  <li>Data recovery from damaged or corrupted devices</li>
                  <li>Compatibility with all devices or software</li>
                  <li>Specific outcomes or results</li>
                </ul>
                <p className="mt-4">
                  <strong>Data Backup:</strong> Clients are strongly encouraged to maintain their own backups. HITS is not responsible for data loss that occurs before, during, or after a service visit.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">User Conduct</h2>
              <p className="text-text-secondary leading-7 mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Use our services for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt our platform or services</li>
                <li>Attempt to gain unauthorized access to any part of our system</li>
                <li>Harass, abuse, or harm our specialists or other users</li>
                <li>Provide false or misleading information</li>
                <li>Resell or redistribute our services without authorization</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Intellectual Property</h2>
              <p className="text-text-secondary leading-7">
                All content, features, and functionality of our platform are owned by HITS and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any content without our express written permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">No Financial, Legal, or Medical Advice</h2>
              <p className="text-text-secondary leading-7">
                HITS specialists may help you use online banking, insurance portals, medical portals, and other websites. They do not provide financial, legal, tax, medical, or mental health advice. Any information provided during a visit is for technical and educational purposes only. You are responsible for contacting your own bank, attorney, tax professional, or healthcare provider for advice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Passwords and Security Responsibility</h2>
              <p className="text-text-secondary leading-7">
                HITS staff and specialists will never ask you to send passwords, PINs, or full card numbers by email, text, or chat. When a password is needed, you should type it yourself on your own device. You agree not to share your passwords with HITS or any specialist, and you remain responsible for keeping your login credentials safe.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Third-Party Services Disclaimer</h2>
              <p className="text-text-secondary leading-7">
                HITS may help you access or use third-party websites, services, or devices (such as banks, email providers, or telehealth portals). Those services are not controlled by HITS. HITS is not responsible for the content, security, decisions, or policies of any third-party service. You agree to follow the terms and privacy policies of those companies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Data and Backups Limitation</h2>
              <p className="text-text-secondary leading-7">
                Before any work begins, you are responsible for keeping copies or backups of important files, photos, and documents. HITS and its specialists will take reasonable care when working on your devices, but we cannot guarantee against data loss, hardware failure, or issues caused by existing viruses, device age, or third-party software.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Independent Contractors</h2>
              <p className="text-text-secondary leading-7">
                HITS – Hire I.T. Specialist connects clients with independent I.T. specialists. Specialists are not employees of HITS; they are independent contractors responsible for their own actions and professional judgment. While HITS performs screening and requires adherence to its code of conduct, HITS is not responsible for any specialist's actions outside the HITS platform or for services performed that are not booked and documented through the platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Limitation of Liability</h2>
              <p className="text-text-secondary leading-7 mb-3">
                To the fullest extent allowed by North Carolina law, HITS – Hire I.T. Specialist, its owners, and its staff are not responsible for:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of data, loss of business, or loss of income</li>
                <li>Problems caused by third-party services, devices, or software</li>
                <li>Any actions of independent specialists outside the HITS platform</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                If HITS is found responsible for any claim, the total liability will be limited to the amount you paid for the specific HITS service related to that claim.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Governing Law and Venue</h2>
              <p className="text-text-secondary leading-7">
                These Terms and any services provided by HITS – Hire I.T. Specialist are governed by and construed in accordance with the laws of the State of North Carolina, without regard to conflict-of-law principles. Any dispute, claim, or lawsuit relating to HITS or these Terms will be brought exclusively in the state or federal courts located in North Carolina, and you consent to the personal jurisdiction of those courts.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Dispute Resolution</h2>
              <p className="text-text-secondary leading-7">
                If you have a concern about a service visit or specialist, please contact us at support@hitsapp.com. We will work with you to resolve disputes fairly and promptly. For disputes that cannot be resolved directly, you may submit a formal dispute through our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Termination</h2>
              <p className="text-text-secondary leading-7">
                We reserve the right to suspend or terminate your account and access to our services at any time, with or without cause or notice, for any reason, including violation of these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Changes to Terms</h2>
              <p className="text-text-secondary leading-7">
                We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of our services after changes become effective constitutes acceptance of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Contact Information</h2>
              <p className="text-text-secondary leading-7">
                If you have questions about these Terms of Service, please contact us at:
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

