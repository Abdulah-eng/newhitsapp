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

export default function SafetyPage() {
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
            Safety & Security
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Your safety and security are our top priorities. Learn how we protect you and your information.
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Our Promise</h2>
              <p className="text-text-secondary leading-7">
                HITS exists to give seniors, disabled adults, and their families calm, trustworthy, one-on-one tech support. We promise to treat every client like family—with care, clear communication, and strong security. Our specialists are patient, respectful, and trained to work at your pace.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">How We Keep You Safe</h2>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">1. Background Checks</h3>
                  <p>All HITS specialists undergo comprehensive background checks before they can provide services. We verify identity, check criminal records, and confirm professional qualifications to ensure your safety and peace of mind.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">2. Secure Payment Processing</h3>
                  <p>All payments are processed securely through Stripe, a trusted payment processor. We never store your full payment card information on our servers. Your financial data is encrypted and protected according to industry standards.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">3. Data Protection</h3>
                  <p>We take data protection seriously. Your personal information is encrypted in transit and at rest, accessible only to authorized personnel and your assigned specialist, never sold to third parties, and protected by strong security measures.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">4. Safe Service Practices</h3>
                  <p>Our specialists are trained to always ask permission before making changes to your devices, explain what they're doing in plain language, never pressure you into buying extra products or services, respect your pace and comfort level, and maintain professional boundaries at all times.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">5. Transparent Communication</h3>
                  <p>You always see the cost of your visit upfront, including any travel fees. You receive a clear receipt after every session. All communication happens through our secure platform, and you can contact support anytime with questions or concerns.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">6. Dispute Resolution</h3>
                  <p>If you have any concerns about a service visit or specialist, we have a clear dispute resolution process. Contact us immediately, and we will work with you to resolve issues fairly and promptly.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">What HITS Is Not</h2>
              <p className="text-text-secondary leading-7 mb-3">
                It's important to understand what HITS does and does not provide:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>HITS is not a 911 or emergency service</li>
                <li>HITS does not provide medical, mental health, or crisis response</li>
                <li>HITS does not provide financial, legal, tax, or medical advice</li>
                <li>HITS does not perform hardware repairs requiring device disassembly or soldering</li>
                <li>HITS specialists are independent contractors, not employees</li>
                <li>HITS cannot guarantee that all technical issues can be resolved</li>
                <li>HITS is not responsible for data loss if backups are not maintained by the client</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Scam & Fraud Protection</h2>
              <p className="text-text-secondary leading-7">
                If you suspect you've been scammed or hacked, contact your bank and local law enforcement immediately. After you're safe, HITS can help secure your devices and accounts, update passwords, and add extra safety protections.
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">How to Report a Concern</h2>
              <p className="text-text-secondary leading-7 mb-3">
                If you have any safety concerns or need to report an issue, please contact us immediately:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Email: <a href="mailto:support@hitsapp.com" className="text-primary-600 hover:text-primary-500">support@hitsapp.com</a></li>
                <li>Phone: <strong>(646) 758-6606</strong></li>
                <li>Through your dashboard: Use the "Contact Support / Report a Concern" button</li>
                <li>For urgent safety issues: Contact local law enforcement first, then reach out to us</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                We take all reports seriously and will investigate promptly. Your safety and satisfaction are our top priorities.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Contact Us</h2>
              <p className="text-text-secondary leading-7">
                If you have questions about our safety and security practices, please contact us:
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

