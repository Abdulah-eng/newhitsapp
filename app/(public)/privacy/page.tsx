"use client";

import { motion } from "framer-motion";

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
            Last updated: November 23, 2025
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-secondary-100">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
            className="bg-white rounded-3xl border border-secondary-200 p-8 md:p-12 shadow-soft space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">1. Introduction</h2>
              <p className="text-text-secondary leading-7">
                HITS – Hire I.T. Specialist ("HITS," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, dashboards, and related services (collectively, the "Services").
              </p>
              <p className="text-text-secondary leading-7 mt-4">
                By accessing or using the Services, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the Services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">2. Scope and Applicability</h2>
              <p className="text-text-secondary leading-7 mb-3">This Privacy Policy applies to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Visitors to our website</li>
                <li>Members (seniors, families, and other customers)</li>
                <li>Specialists and partners who use our platform</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                This Policy does not apply to third-party sites or services that are not controlled by HITS, even if you access them through our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">3. Information We Collect</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">A. Personal Information You Provide</h3>
                  <p className="mb-2">We collect information you provide directly, including:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Billing and payment information (processed securely through Stripe or other payment processors)</li>
                    <li>Service address and general location (for in-person appointments)</li>
                    <li>Account login credentials and profile details</li>
                    <li>Appointment requests, support tickets, and messages sent through our site or chat assistant</li>
                    <li>Feedback, reviews, and survey responses</li>
                  </ul>
                  <p className="mt-3">If you are a Specialist, we may also collect:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Professional and background details</li>
                    <li>Skills, certifications, and areas of expertise</li>
                    <li>Availability, rates (if applicable), and service preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">B. Usage and Device Information</h3>
                  <p className="mb-2">We automatically collect certain information when you use the Services, such as:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Device type, operating system, and browser type</li>
                    <li>IP address and approximate location</li>
                    <li>Dates, times, and pages viewed</li>
                    <li>Clicks, navigation paths, and time spent on different parts of the site</li>
                    <li>Appointment history and interaction logs with our AI chatbox</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">C. Cookies and Tracking Technologies</h3>
                  <p className="mb-2">We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Keep you signed in</li>
                    <li>Remember your preferences</li>
                    <li>Analyze site traffic and usage patterns</li>
                    <li>Improve security and performance</li>
                  </ul>
                  <p className="mt-3">
                    You can control cookies through your browser settings, but disabling them may impact some features of the Services.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">4. How We Use Your Information</h2>
              <p className="text-text-secondary leading-7 mb-3">We use your information to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Provide, operate, and maintain the Services</li>
                <li>Create and manage your account</li>
                <li>Process appointments, memberships, and payments</li>
                <li>Facilitate communication between members and specialists</li>
                <li>Power AI-driven features (such as recommendation and matching tools)</li>
                <li>Respond to questions, requests, and support needs</li>
                <li>Monitor, detect, and prevent fraud, abuse, or security incidents</li>
                <li>Analyze usage to improve and develop new features</li>
                <li>Send transactional emails (receipts, confirmations, service updates)</li>
                <li>Send optional marketing or educational messages, where permitted</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                We may also use aggregated or de-identified information that cannot reasonably be used to identify you, for analytics, research, and business planning.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">5. Information Sharing</h2>
              <p className="text-text-secondary leading-7 mb-3">We do not sell your personal information. We share your information only in the following circumstances:</p>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">A. With Service Providers</h3>
                  <p className="mb-2">We share information with trusted third-party service providers who help us operate our platform, such as:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Payment processors (e.g., Stripe)</li>
                    <li>Hosting and cloud providers</li>
                    <li>Customer support and email providers</li>
                    <li>Analytics and security tools</li>
                  </ul>
                  <p className="mt-3">These providers are permitted to use your information only to perform services on our behalf and are expected to protect it.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">B. With Specialists</h3>
                  <p className="mb-2">When you book an appointment or interact with a specialist, we share only the information needed to provide the service, such as:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Your name</li>
                    <li>Contact details</li>
                    <li>Service address (for in-person visits)</li>
                    <li>Details about the service requested</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">C. Legal Requirements and Safety</h3>
                  <p className="mb-2">We may disclose information if we believe in good faith that doing so is:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Required by law, regulation, subpoena, or court order</li>
                    <li>Necessary to protect the rights, property, or safety of HITS, our users, or others</li>
                    <li>Necessary to detect, prevent, or address fraud, security, or technical issues</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">D. Business Transfers</h3>
                  <p>
                    If HITS is involved in a merger, acquisition, restructuring, or sale of assets, your information may be transferred as part of that transaction. We will take reasonable steps to ensure the receiving party honors this Privacy Policy or a successor policy that is materially similar.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">6. Data Security</h2>
              <p className="text-text-secondary leading-7 mb-3">We implement reasonable administrative, technical, and physical safeguards designed to protect your personal information, including:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Encrypted transmission of data over HTTPS</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Access controls limiting who can view sensitive information</li>
                <li>Monitoring for unauthorized access or suspicious activity</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                However, no system can be guaranteed 100% secure. You are responsible for keeping your account password confidential and notifying us immediately if you suspect unauthorized access to your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">7. Data Retention</h2>
              <p className="text-text-secondary leading-7">
                We retain personal information only as long as reasonably necessary to:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2 mt-3">
                <li>Provide the Services</li>
                <li>Comply with legal, tax, or accounting obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                When information is no longer needed, we will delete it or de-identify it in accordance with applicable law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">8. Your Choices and Rights</h2>
              <p className="text-text-secondary leading-7 mb-3">
                Depending on where you live, you may have certain rights regarding your personal information. Subject to applicable law, you may:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Access and review the personal information we hold about you</li>
                <li>Update or correct your information through your account or by contacting us</li>
                <li>Request deletion of your account and associated personal information, subject to legal or operational limits</li>
                <li>Opt out of receiving marketing emails by using the "unsubscribe" link in those emails</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                To exercise any of these rights, contact us at support@hitsapp.com. We may take steps to verify your identity before fulfilling your request.
              </p>
              <p className="text-text-secondary leading-7 mt-4">
                For residents of North Carolina and other U.S. states, we will handle your information and any data-breach notifications in accordance with applicable state and federal laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">9. Third-Party Links</h2>
              <p className="text-text-secondary leading-7">
                Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties. We encourage you to review their privacy policies before submitting any personal information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">10. Children's Privacy</h2>
              <p className="text-text-secondary leading-7">
                Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will take steps to delete it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-text-secondary leading-7 mb-3">We may update this Privacy Policy from time to time. When we make material changes, we will:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Update the "Last updated" date at the top of this page, and</li>
                <li>Take additional steps as required by law (for example, providing notice through the site or by email).</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                Your continued use of the Services after any update means you accept the revised Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">12. Contact Us</h2>
              <p className="text-text-secondary leading-7 mb-3">
                If you have questions about this Privacy Policy or our data practices, or if you wish to exercise your privacy rights, please contact us:
              </p>
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <p className="text-text-primary font-medium">HITS – Hire I.T. Specialist</p>
                <p className="text-text-secondary">Email: support@hitsapp.com</p>
                <p className="text-text-secondary">Phone: (646) 758-6606</p>
                <p className="text-text-secondary mt-2">Mailing Address: (add your NC business mailing address here once finalized)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
