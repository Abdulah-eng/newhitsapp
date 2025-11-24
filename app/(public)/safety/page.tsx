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

export default function SafetyPage() {
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
            Safety & Security Policy
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Last Updated: November 23, 2025
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
            <h2 className="text-2xl font-bold text-error-700 mb-4">1. Emergency Disclaimer</h2>
            <p className="text-base leading-7 text-text-secondary mb-3">
              HITS is not an emergency, crisis, or first-responder service.
            </p>
            <p className="text-base leading-7 text-text-secondary mb-3">
              For emergencies — including threats to personal safety, medical emergencies, active fraud, cybercrime in progress, fires, or hazardous situations — call 911 immediately or contact:
            </p>
            <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
              <li>Local law enforcement</li>
              <li>Your bank or credit card company (for active fraud)</li>
              <li>Your emergency contacts</li>
              <li>Appropriate medical or crisis services</li>
            </ul>
            <p className="text-base leading-7 text-text-secondary mt-4 font-semibold">
              HITS Specialists are not trained or authorized to respond to emergencies.
            </p>
          </motion.div>
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">2. In-Person Appointment Safety</h2>
              <p className="text-text-secondary leading-7 mb-3">
                To protect both Members and Specialists, we implement the following safeguards:
              </p>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">A. Address Verification</h3>
                  <p className="mb-2">Members must provide an accurate service address.</p>
                  <p className="mb-2">Appointments may be denied or cancelled if:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>An address is incomplete or misleading</li>
                    <li>A location appears unsafe</li>
                    <li>A Specialist cannot gain safe entry</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">B. Safe Environment Requirements</h3>
                  <p className="mb-2">Members agree to maintain a reasonably safe environment, including:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Securing pets if necessary</li>
                    <li>Removing hazards from the workspace</li>
                    <li>Providing adequate lighting</li>
                    <li>Ensuring adult supervision for vulnerable individuals</li>
                  </ul>
                  <p className="mt-3">
                    If a Specialist feels unsafe at any time, they may end the appointment.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">C. Specialist Identification</h3>
                  <p className="mb-2">Specialists may provide identification upon request and will confirm:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Their name</li>
                    <li>Their role</li>
                    <li>Your booking details</li>
                  </ul>
                  <p className="mt-3">
                    HITS discourages Specialists from entering homes where the environment appears unsafe.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">3. Online Safety & Remote Support</h2>
              <p className="text-text-secondary leading-7 mb-3">
                Remote support sessions may involve screen sharing or remote desktop tools. To maintain safety:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Specialists will never ask for your full Social Security number.</li>
                <li>Specialists will never ask for your full banking passwords.</li>
                <li>Members should never grant remote access to individuals outside the HITS platform.</li>
                <li>Sensitive financial portals (banking, investments, etc.) should be closed before your session begins.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 font-semibold">
                If you see anything suspicious during a session, disconnect immediately and notify HITS.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">4. Specialist Screening & Conduct Standards</h2>
              <p className="text-text-secondary leading-7 mb-3">
                HITS Specialists are independent professionals who must comply with HITS standards.
              </p>
              <div className="space-y-4 text-text-secondary leading-7">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">A. Screening and Verification</h3>
                  <p className="mb-2">Where permitted by law, HITS may conduct:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Identity verification</li>
                    <li>Background checks (when applicable)</li>
                    <li>Skills and experience reviews</li>
                    <li>Professional screening interviews</li>
                  </ul>
                  <p className="mt-3">
                    We do not guarantee that a Specialist has passed a criminal background check in every state; some states and counties limit the type of information we can legally obtain.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">B. Conduct Requirements</h3>
                  <p className="mb-2">Specialists must:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Behave professionally and respectfully</li>
                    <li>Maintain confidentiality of Member information</li>
                    <li>Follow lawful and ethical practices</li>
                    <li>Avoid unsafe or inappropriate activities</li>
                    <li>Notify HITS of any safety or behavioral concerns</li>
                  </ul>
                  <p className="mt-3">
                    Violation of these standards may result in suspension or removal.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">5. Data & Cybersecurity Standards</h2>
              <p className="text-text-secondary leading-7 mb-3">
                HITS uses industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>HTTPS encrypted connections</li>
                <li>Secure authentication and credential hashing</li>
                <li>PCI-compliant payment processing through Stripe</li>
                <li>Limited access controls (only authorized personnel)</li>
                <li>Routine system monitoring</li>
                <li>Firewalls and intrusion detection systems</li>
                <li>Secure handling of remote sessions</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 mb-3">You are responsible for:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Protecting your device passwords</li>
                <li>Not sharing sensitive personal information unnecessarily</li>
                <li>Keeping all software (Windows, macOS, browsers) up to date</li>
                <li>Alerting us to suspicious activity involving your account</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">6. Fraud Prevention & Scam Awareness</h2>
              <p className="text-text-secondary leading-7 mb-3">
                HITS actively monitors for fraudulent or malicious behavior.
              </p>
              <p className="text-text-secondary leading-7 mb-3">For your protection:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Specialists will never request payment outside the platform</li>
                <li>You should never accept off-platform service arrangements</li>
                <li>You should never send money directly to a Specialist</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 font-semibold">
                If someone contacts you claiming to be from HITS and asks for money, codes, logins, or remote access, report it immediately to support@hitsapp.com.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">7. AI Safety Practices</h2>
              <p className="text-text-secondary leading-7 mb-3">
                HITS may provide AI-powered tools for support guidance or automated answers.
              </p>
              <p className="text-text-secondary leading-7 mb-3 font-semibold">
                AI is not a replacement for a trained Specialist or professional tech support.
              </p>
              <p className="text-text-secondary leading-7 mb-3">You should not rely on AI for:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Safety-critical instructions</li>
                <li>Legal advice</li>
                <li>Medical information</li>
                <li>Emergency troubleshooting (fire, flood, device overheating, smoke, etc.)</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                Any automated instruction should be validated with a live Specialist.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">8. Reporting Safety Concerns</h2>
              <p className="text-text-secondary leading-7 mb-3">
                We take all safety concerns seriously.
              </p>
              <p className="text-text-secondary leading-7 mb-3">Please report:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Unsafe or threatening behavior</li>
                <li>Suspicious communications</li>
                <li>Fraud attempts</li>
                <li>Harassment</li>
                <li>Privacy or data concerns</li>
                <li>A Specialist acting unprofessionally</li>
                <li>A Member behaving inappropriately toward a Specialist</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 mb-3">Report directly to:</p>
              <div className="p-4 bg-secondary-50 rounded-lg">
                <p className="text-text-primary font-medium">support@hitsapp.com</p>
                <p className="text-text-secondary mt-2">or call</p>
                <p className="text-text-primary font-medium mt-2">(646) 758-6606</p>
              </div>
              <p className="text-text-secondary leading-7 mt-4">
                You may request that a manager or supervisor follow up.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">9. Service Limitations</h2>
              <p className="text-text-secondary leading-7 mb-3">
                For safety and legal reasons, Specialists cannot assist with:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Illegal activities</li>
                <li>Bypassing security or digital rights protections</li>
                <li>Hacking or unauthorized access</li>
                <li>Installing pirated software</li>
                <li>Activities that violate manufacturer or carrier agreements</li>
                <li>Climbing on roofs, attics, crawl spaces, or unstable structures</li>
                <li>Physical repairs requiring professional certifications (e.g., electrical work)</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                The Specialist may decline or stop a service that violates safety guidelines.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">10. Policy Updates</h2>
              <p className="text-text-secondary leading-7 mb-3">We may update this Safety & Security Policy periodically.</p>
              <p className="text-text-secondary leading-7 mb-3">When we make material changes:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>We will update the "Last Updated" date, and</li>
                <li>Provide additional notice if required by law.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                Your continued use of the Services after changes become effective means you accept the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">11. Contact Information</h2>
              <p className="text-text-secondary leading-7 mb-3">
                If you have questions or need assistance regarding safety:
              </p>
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <p className="text-text-primary font-medium">HITS – Hire I.T. Specialist, Inc.</p>
                <p className="text-text-secondary">Email: support@hitsapp.com</p>
                <p className="text-text-secondary">Phone: (646) 758-6606</p>
                <p className="text-text-secondary mt-2">Mailing Address: (Add your NC business mailing address here once finalized)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
