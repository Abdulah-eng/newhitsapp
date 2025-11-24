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

export default function TermsOfServicePage() {
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
            Terms of Service
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
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.15}
            variants={fade}
            className="mt-4 text-base leading-7 text-text-secondary max-w-3xl mx-auto"
          >
            These Terms of Service ("Terms") govern your access to and use of the website, platform, and services offered by HITS – Hire I.T. Specialist, Inc. ("HITS," "we," "us," or "our").
          </motion.p>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fade}
            className="mt-4 text-base leading-7 text-text-secondary max-w-3xl mx-auto"
          >
            By creating an account, booking a service, purchasing a membership, or otherwise using our services (collectively, the "Services"), you agree to be bound by these Terms and our Privacy Policy and Safety & Security Policy.
          </motion.p>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.25}
            variants={fade}
            className="mt-4 text-base leading-7 text-text-secondary max-w-3xl mx-auto font-semibold"
          >
            If you do not agree to these Terms, do not use the Services.
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">1. Overview of the HITS Platform</h2>
              <p className="text-text-secondary leading-7">
                HITS provides a platform that connects individuals, families, and organizations ("Members" or "you") with independent technology professionals ("Specialists") who offer:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2 mt-3">
                <li>In-person technology support</li>
                <li>Remote / online tech support and concierge services</li>
                <li>Group workshops and educational sessions</li>
                <li>Other technology-related assistance as described on our site</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 font-semibold">
                HITS is not a 911 or emergency service and does not provide medical, legal, financial, or mental health advice.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">2. Eligibility</h2>
              <p className="text-text-secondary leading-7 mb-3">To use the Services, you represent and warrant that:</p>
              <ol className="list-decimal list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>You are at least 18 years old;</li>
                <li>You are legally capable of entering into a binding contract; and</li>
                <li>You will use the Services only in accordance with these Terms and applicable law.</li>
              </ol>
              <p className="text-text-secondary leading-7 mt-4">
                If you are using the Services on behalf of another person (e.g., an elderly parent) or an organization, you represent that you are authorized to accept these Terms on their behalf.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">3. Accounts & Security</h2>
              <p className="text-text-secondary leading-7 mb-3">To access certain features (such as booking, memberships, or dashboards), you may need to create an account.</p>
              <p className="text-text-secondary leading-7 mb-3">You agree to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Provide accurate, current, and complete information;</li>
                <li>Keep your login credentials confidential;</li>
                <li>Notify us immediately at support@hitsapp.com if you suspect unauthorized access; and</li>
                <li>Be responsible for all activity that occurs under your account.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                HITS is not liable for losses resulting from unauthorized use of your account if caused by your failure to safeguard your credentials.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">4. Description of Services</h2>
              <p className="text-text-secondary leading-7 mb-3">HITS may provide, facilitate, or enable access to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Online concierge tech support (e.g., Starter, Essential, Family memberships)</li>
                <li>In-person tech support visits in supported areas</li>
                <li>Remote sessions via phone, video, or remote desktop tools</li>
                <li>Specialist matching and appointment booking</li>
                <li>Educational content, workshops, and resources</li>
                <li>AI-powered tools, including the HITS Assistant chatbox</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                Features and availability may change over time and may differ by location.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">5. Memberships & Pricing</h2>
              <p className="text-text-secondary leading-7 mb-3">HITS currently offers two main categories of membership:</p>
              <ol className="list-decimal list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Online-Only Tech Support Memberships (e.g., Starter, Essential, Family)</li>
                <li>In-Person Tech Support Memberships, as listed on the Pricing & Plans page</li>
              </ol>
              <p className="text-text-secondary leading-7 mt-4 mb-3">Key points:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Membership benefits, limits (e.g., number of sessions), and included services are described on the Pricing & Plans and Concierge/Consumer pages.</li>
                <li>Memberships may auto-renew as described at checkout unless you cancel in accordance with these Terms.</li>
                <li>HITS controls all default pricing. Specialists cannot set or override platform pricing.</li>
              </ul>
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <h3 className="font-semibold text-text-primary mb-2">Standard Service Rate (Non-Membership / Per-Visit)</h3>
                <p className="text-text-secondary leading-7 mb-2">Unless otherwise stated in writing:</p>
                <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-1">
                  <li>The standard rate is $95 for the first hour, and</li>
                  <li>$45 for each additional hour of service.</li>
                </ul>
                <p className="text-text-secondary leading-7 mt-3">
                  Taxes, fees, or surcharges may apply depending on your location.
                </p>
              </div>
              <p className="text-text-secondary leading-7 mt-4">
                All pricing and membership structures are subject to change, but changes will not be applied retroactively to services you have already booked or paid for.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">6. Booking, Rescheduling & Cancellations</h2>
              <p className="text-text-secondary leading-7 mb-3">When you book:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>You agree to provide accurate details about the service needed, location (for in-person), and contact information.</li>
                <li>You agree to be present or ensure an authorized adult is present at the appointment time.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 mb-3">HITS may implement cancellation and rescheduling rules, including:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Minimum notice requirements for cancelling or changing an appointment;</li>
                <li>Possible fees for late cancellations, no-shows, or repeated schedule changes.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                These rules will be communicated on the site, at checkout, or in your confirmation emails. Repeated misuse (no-shows, frequent last-minute cancellations, abusive behavior) may lead to account suspension.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">7. Payments & Billing</h2>
              <p className="text-text-secondary leading-7 mb-3">All payments are processed securely through approved third-party payment processors (such as Stripe).</p>
              <p className="text-text-secondary leading-7 mb-3">You agree that:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>You will provide valid, authorized payment details;</li>
                <li>HITS may charge your payment method for bookings, memberships, add-ons, and applicable taxes/fees;</li>
                <li>If a payment is declined, we may suspend or cancel your access to Services or future bookings.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                HITS does not store your full credit card number. Payment processing is subject to the terms and policies of our payment providers.
              </p>
              <p className="text-text-secondary leading-7 mt-4 font-semibold">
                Unless specified otherwise in writing: All fees are non-refundable, except where required by law or where HITS chooses, in its sole discretion, to issue a credit or refund.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">8. Relationship Between HITS and Specialists</h2>
              <p className="text-text-secondary leading-7 mb-3 font-semibold">Specialists are independent contractors, not employees, agents, or partners of HITS.</p>
              <p className="text-text-secondary leading-7 mb-3">Accordingly:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>HITS does not control how Specialists perform their work, beyond our policies and standards.</li>
                <li>Specialists are responsible for complying with applicable laws and regulations, including any licensing requirements in their area.</li>
                <li>HITS is not responsible for a Specialist's acts or omissions, including any property damage, data loss, or personal injury that may occur during or after services.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                You acknowledge that your direct service relationship (install, troubleshooting, setup, etc.) is with the Specialist, and HITS functions as a platform to facilitate the connection and payment.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">9. User Responsibilities</h2>
              <p className="text-text-secondary leading-7 mb-3">You agree to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Provide accurate, complete, and non-misleading information when requesting services;</li>
                <li>Ensure a safe environment for Specialists during in-person visits (including safe access to the property, pets secured as needed, and a non-threatening environment);</li>
                <li>Use the Services only for lawful purposes;</li>
                <li>Not attempt to defraud, exploit, or harm a Specialist, HITS, or other users;</li>
                <li>Follow instructions, safety guidelines, and reasonable requests from Specialists and HITS staff.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                If you are arranging services for a third party (for example, an older parent or relative), you are responsible for ensuring that they understand and consent to the services being provided.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">10. Prohibited Conduct</h2>
              <p className="text-text-secondary leading-7 mb-3">You may not:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Use the Services for any illegal, harmful, or abusive purpose;</li>
                <li>Harass, threaten, or intimidate Specialists, staff, or other users;</li>
                <li>Attempt to circumvent the platform (e.g., bypass HITS to avoid fees, solicit off-platform services that violate policies);</li>
                <li>Interfere with or disrupt the operation of the Services (including hacking, attempting to bypass security, or introducing malware);</li>
                <li>Misrepresent your identity or affiliation;</li>
                <li>Collect or harvest data from the platform without written permission.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                HITS reserves the right to investigate, suspend, or terminate accounts suspected of violating this section.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">11. AI Tools & Automated Features</h2>
              <p className="text-text-secondary leading-7 mb-3">HITS may provide AI-powered tools such as the HITS Assistant chatbox to:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Help answer questions;</li>
                <li>Guide users in understanding services;</li>
                <li>Offer suggestions or educational information;</li>
                <li>Prompt users to book appointments after a certain number of messages.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 mb-3">You understand and agree that:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>AI responses are generated automatically and may not always be accurate or complete;</li>
                <li>AI tools are not a substitute for human specialists or professional advice;</li>
                <li>You should not rely solely on AI for decisions involving safety, medical, legal, financial, or emergency matters.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 font-semibold">
                For urgent issues, always contact a live specialist, 911, or other appropriate professionals.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">12. Intellectual Property</h2>
              <p className="text-text-secondary leading-7 mb-3">
                All content on the HITS platform—including logos, branding, text, graphics, icons, and software—is owned by or licensed to HITS and is protected by intellectual property laws.
              </p>
              <p className="text-text-secondary leading-7 mb-3">You may not:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Copy, reproduce, modify, distribute, or create derivative works from the platform content;</li>
                <li>Use the HITS name, logo, or branding without prior written permission.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                You retain ownership of any content you submit (feedback, reviews, etc.), but grant HITS a non-exclusive, worldwide, royalty-free license to use, display, and reproduce that content in connection with operating and promoting the Services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">13. Third-Party Links and Services</h2>
              <p className="text-text-secondary leading-7 mb-3">The Services may include links to third-party websites, services, or tools. HITS is not responsible for:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>The content, policies, or practices of those third parties;</li>
                <li>Any losses or issues arising from your use of third-party services.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                You should review each third party's own terms and policies before using their services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">14. Disclaimer of Warranties</h2>
              <p className="text-text-secondary leading-7 mb-3">
                To the fullest extent permitted by law, the Services are provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, whether express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Warranties of merchantability;</li>
                <li>Fitness for a particular purpose;</li>
                <li>Non-infringement;</li>
                <li>Accuracy, reliability, or completeness of any content or information.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4 mb-3">HITS does not warrant that:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>The Services will be uninterrupted, secure, or error-free;</li>
                <li>All defects will be corrected;</li>
                <li>Any specific outcome or result will be achieved from using a Specialist.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">15. Limitation of Liability</h2>
              <p className="text-text-secondary leading-7 mb-3">To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>HITS and its officers, directors, employees, and agents are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, property damage, or personal injury arising out of or related to your use of the Services.</li>
                <li>In no event will HITS's total liability for any claim arising out of or relating to the Services exceed the greater of:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>The amount you paid to HITS for the service giving rise to the claim in the 12 months before the claim, or</li>
                    <li>One hundred U.S. dollars ($100).</li>
                  </ul>
                </li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                Some jurisdictions do not allow certain limitations of liability, so some of the above may not apply to you. In such cases, HITS's liability will be limited to the extent permitted by applicable law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">16. Indemnification</h2>
              <p className="text-text-secondary leading-7">
                You agree to indemnify, defend, and hold harmless HITS and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to:
              </p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2 mt-3">
                <li>Your use of the Services;</li>
                <li>Your violation of these Terms or any applicable law;</li>
                <li>Your interaction with a Specialist;</li>
                <li>Your infringement of any third party's rights.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">17. Suspension and Termination</h2>
              <p className="text-text-secondary leading-7 mb-3">HITS may, at its sole discretion and without liability, suspend or terminate your account or access to the Services if:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>You violate these Terms or any other posted policy;</li>
                <li>We suspect fraudulent, abusive, or unsafe behavior;</li>
                <li>We are required by law or a government authority.</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                You may stop using the Services at any time. Certain provisions of these Terms (including Limitation of Liability, Indemnification, and Governing Law) will survive any termination.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">18. Governing Law & Dispute Resolution</h2>
              <p className="text-text-secondary leading-7">
                These Terms are governed by the laws of the State of North Carolina, without giving effect to its conflict-of-law rules.
              </p>
              <p className="text-text-secondary leading-7 mt-4">
                You agree that any dispute, claim, or controversy arising out of or relating to these Terms or your use of the Services will be brought exclusively in the state or federal courts located in North Carolina, and you consent to the personal jurisdiction of those courts.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">19. Changes to These Terms</h2>
              <p className="text-text-secondary leading-7 mb-3">We may update these Terms from time to time. When we make material changes, we will:</p>
              <ul className="list-disc list-inside text-text-secondary leading-7 ml-4 space-y-2">
                <li>Update the "Last updated" date at the top of this page; and</li>
                <li>Provide additional notice when required by law (for example, through the site or by email).</li>
              </ul>
              <p className="text-text-secondary leading-7 mt-4">
                Your continued use of the Services after the effective date of any changes means you accept the revised Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary-700 mb-4">20. Contact Us</h2>
              <p className="text-text-secondary leading-7 mb-3">
                If you have questions about these Terms or the Services, please contact:
              </p>
              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <p className="text-text-primary font-medium">HITS – Hire I.T. Specialist, Inc.</p>
                <p className="text-text-secondary">Email: support@hitsapp.com</p>
                <p className="text-text-secondary">Phone: (646) 758-6606</p>
                <p className="text-text-secondary mt-2">Mailing Address: (add your NC business mailing address here)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
