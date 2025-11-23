"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function AboutPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-20 lg:py-28">
          <motion.div {...fadeUp(0)} className="text-center max-w-4xl mx-auto">
            <h1 className="text-[40px] md:text-[52px] font-extrabold leading-tight text-primary-900">
              About HITS – Hire I.T. Specialist
            </h1>
            <p className="mt-6 text-xl md:text-2xl font-semibold text-primary-700 leading-relaxed">
              Calm, patient tech help for seniors, disabled adults, and the families who love them.
            </p>
            <p className="mt-8 text-lg text-text-secondary leading-8">
              HITS – Hire I.T. Specialist was created for people who are tired of feeling rushed, talked down to, or ignored when they ask for help with technology.
            </p>
            <p className="mt-6 text-lg text-text-secondary leading-8">
              Too many seniors and disabled adults have been:
            </p>
            <ul className="mt-4 text-left max-w-2xl mx-auto space-y-3 text-lg text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="mt-2 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span>spoken to like they're a burden</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span>pushed into services they don't understand</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span>left scared of scams and unsure who to trust</span>
              </li>
            </ul>
            <p className="mt-8 text-lg text-text-secondary leading-8">
              HITS is the answer to that problem: patient, one-on-one support, clear explanations, and strong security from silent professionals who understand what it means to protect people.
            </p>
            <p className="mt-6 text-lg text-text-secondary leading-8">
              Whether it's setting up a new phone, getting rid of a virus, joining a telehealth visit, or making sure online banking feels safe, HITS is designed to meet people where they are without judgment or pressure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Mission
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-6 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary"
          >
            Our mission is to bridge the gap between seniors, disabled adults, families, and everyday technology by providing patient, respectful, and secure tech support that people can actually trust.
          </motion.p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Vision
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-6 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary mb-6"
          >
            Our vision is a world where:
          </motion.p>
          <div className="mt-8 space-y-4 max-w-3xl mx-auto">
            {[
              "older adults and disabled adults feel confident and independent online,",
              "caregivers feel supported, not overwhelmed, and",
              "families stay connected and protected without tech getting in the way.",
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(0.1 + idx * 0.1)}
                className="flex items-start gap-3 p-4 rounded-2xl border border-secondary-200 bg-white"
              >
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span className="text-base text-text-secondary">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Who We Serve
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-4 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary mb-8"
          >
            HITS is designed for:
          </motion.p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Older adults living on their own or with family",
              "Disabled adults and people with accessibility needs",
              "Adult children and caregivers supporting loved ones",
              "Families wanting a long-term, trusted \"tech helper\"",
              "Organizations serving seniors, disabled adults, and other vulnerable populations",
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(0.1 + idx * 0.1)}
                className="flex items-start gap-3 p-4 rounded-2xl border border-secondary-200 bg-secondary-50"
              >
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span className="text-base text-text-secondary">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How HITS Works Section */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            How HITS Works
          </motion.h2>
          <div className="mt-12 space-y-6 max-w-3xl mx-auto">
            {[
              { step: "1", text: "Share what you need help with.", detail: "Tell us, in plain language, what's going wrong: a password problem, a \"no signal\" message, strange emails, or trouble joining a video call." },
              { step: "2", text: "Get matched with a vetted I.T. specialist.", detail: "We connect you with a patient, background-checked specialist who understands how to work at your pace." },
              { step: "3", text: "Choose a time and see your cost upfront.", detail: "You pick a visit time that works for you and see the pricing and any travel fee before you confirm. No surprises." },
              { step: "4", text: "Get one-on-one help and a clear visit summary.", detail: "Your specialist walks you through each step, answers questions, and provides a simple summary of what was done and any next steps." },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                {...fadeUp(0.1 + idx * 0.1)}
                className="flex items-start gap-4 p-6 rounded-2xl border border-secondary-200 bg-white"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-text-primary mb-2">{item.text}</p>
                  <p className="text-base text-text-secondary">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Heart Behind HITS Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            The Heart Behind HITS
          </motion.h2>
          <div className="mt-8 space-y-6 max-w-3xl mx-auto">
            <motion.div
              {...fadeUp(0.1)}
              className="p-6 rounded-2xl border border-secondary-200 bg-secondary-50"
            >
              <h3 className="text-xl font-bold text-primary-700 mb-3">1. Care First</h3>
              <ul className="space-y-2 text-base leading-7 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>Every visit starts with listening.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>The pace is set by the client, not the clock.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>Breaks, questions, and "can you show me that again?" are always welcome.</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp(0.2)}
              className="p-6 rounded-2xl border border-secondary-200 bg-secondary-50"
            >
              <h3 className="text-xl font-bold text-primary-700 mb-3">2. Clear Communication</h3>
              <ul className="space-y-2 text-base leading-7 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>No tech jargon. No scary tactics. No hidden fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>Clients get calm, honest explanations in plain language they can repeat to their doctor, caregiver, or family.</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp(0.3)}
              className="p-6 rounded-2xl border border-secondary-200 bg-secondary-50"
            >
              <h3 className="text-xl font-bold text-primary-700 mb-3">3. Strong Security</h3>
              <ul className="space-y-2 text-base leading-7 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>From passwords and online banking to telehealth portals and email, HITS is designed with safety and privacy in mind.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>Tools and methods are chosen to protect, not overwhelm.</span>
                </li>
              </ul>
            </motion.div>
          </div>
          <motion.p
            {...fadeUp(0.4)}
            className="mt-10 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary"
          >
            HITS exists to give seniors, disabled adults, and their families calm, trustworthy, one-on-one tech support, whether that's at the kitchen table or over a secure video call.
          </motion.p>
        </div>
      </section>

      {/* What That Means for HITS Clients Section */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            What That Means for HITS Clients
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-6 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary mb-8"
          >
            For seniors, disabled adults, and families, working with HITS means:
          </motion.p>
          <div className="mt-8 space-y-4 max-w-3xl mx-auto">
            {[
              "A patient specialist who listens first",
              "Clear pricing with no surprises",
              "Help that respects your time, your dignity, and your boundaries",
              "Security practices shaped by real-world cybersecurity experience",
              "Support that feels less like a \"tech appointment\" and more like a trusted family member helping you get things back on track",
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp(0.1 + idx * 0.1)}
                className="flex items-start gap-3 p-4 rounded-2xl border border-secondary-200 bg-white"
              >
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <span className="text-base text-text-secondary">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Philosophy Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto text-center">
            <p className="text-lg leading-8 text-text-secondary mb-8">
              All of this work centers on a simple idea:
            </p>
            <p className="text-xl leading-8 text-text-secondary mb-10">
              Use serious cybersecurity and technical skill to quietly make life easier, safer, and less stressful for people who may not consider themselves "tech savvy."
            </p>
            <p className="text-lg leading-8 text-text-secondary mb-8">
              That's what HITS is meant to be:
            </p>
            <div className="bg-primary-50 rounded-3xl border-2 border-primary-200 p-8 md:p-12 my-8">
              <p className="text-2xl md:text-3xl font-bold text-primary-700 italic leading-relaxed">
                professional-level tech support with the heart of a trusted friend or family member.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Meet the Founder
          </motion.h2>
          <motion.div
            {...fadeUp(0.1)}
            className="mt-12 rounded-3xl border border-secondary-200 bg-white p-8 md:p-12 shadow-soft"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-primary-700 mb-2">Shane Thompson</h3>
              <p className="text-xl text-text-secondary">Founder</p>
            </div>
            <div className="space-y-6 text-base leading-7 text-text-secondary">
              <p>
                Shane Thompson is a disabled, retired U.S. Army veteran with 4 combat tours and a lifelong commitment to service.
              </p>
              <p>
                After serving his country, Shane shifted his focus to serving his community. He earned a Bachelor of Arts in Organizational Management from the University of Arizona and a Bachelor of Science in Computer Information Technology with concentrations in Cybersecurity, Information Assurance, and Business Information Systems from Methodist University. He is also a proud member of three honor societies: Omicron Delta Kappa (ODK), the National Society of Leadership and Success (NSLS), and SVA – Chi Delta Chi, recognizing his leadership, service, and academic excellence.
              </p>
              
              <div className="mt-8">
                <h4 className="text-lg font-bold text-primary-700 mb-4">Professional Background – Cybersecurity Work</h4>
                <p className="mb-4">
                  Shane reinforces his real-world experience with practical, hands on cybersecurity work that now supports how he protects HITS clients and their families:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>He has led digital forensics and malware analysis work, using tools like FTK Imager, USBDeview, and Wireshark to investigate suspicious activity, recover data, and understand how attackers hide inside everyday systems.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>He has worked on network monitoring and packet analysis, building test networks and using Wireshark to detect unusual traffic patterns; skills that translate directly into securing home Wi-Fi, routers, and connected devices.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>He has carried out mobile device security and mobile-device-management (MDM) work, focusing on practical ways to protect smartphones and tablets with safer settings, encryption, and remote-wipe options, the same devices many seniors depend on every day.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>He has developed cybersecurity policies and risk-management plans, aligning them with industry standards to support privacy, responsible data use, and clear safety guidelines; principles that show up in HITS safety, privacy, and no-pressure approach.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>He has helped design secure data and information-handling practices, emphasizing data integrity, access control, and behind-the-scenes protection so client visit notes and account details stay private and properly handled.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>He has participated in hands-on penetration testing and ethical hacking against real-world targets, identifying vulnerabilities and documenting how to fix them is experience that feeds directly into hardening home networks, smart devices, and online accounts before issues become emergencies.</span>
                  </li>
                </ul>
                <p className="mt-6">
                  All of this work centers on a simple idea:
                </p>
                <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200 my-6">
                  <p className="text-lg font-semibold text-primary-700 italic text-center">
                    Use serious cybersecurity skill to quietly make life easier, safer, and less stressful for people who may not consider themselves "tech savvy."
                  </p>
                </div>
              </div>

              <p>
                He is currently expanding that foundation by attending North Carolina State University, pursuing the Master of Science in Cybersecurity (MCYS). In this graduate program, he is focused on:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>designing and analyzing secure, privacy aware systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>securing critical infrastructure such as networks, cloud services, and connected devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>enhancing the security and privacy of end-user technologies like mobile, web, IoT, and emerging platforms</span>
                </li>
              </ul>
              <p>
                Shane has been "the tech person" for as long as he can remember—
              </p>
              <p>
                the one people call when:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>the laptop won't turn on,</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>the Wi-Fi keeps dropping,</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>the TV says "no signal,"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>or the email looks "a little funny."</span>
                </li>
              </ul>
              <p>
                He fixes laptops, cleans out viruses, recovers priceless photos, sets up new devices, and most importantly, explains technology in plain language.
              </p>
              <p>
                After seeing too many seniors and disabled adults get:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>rushed through appointments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>talked down to</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>overcharged for things they didn't need</span>
                </li>
              </ul>
              <p>
                he started HITS – Hire I.T. Specialist with one simple promise:
              </p>
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200 my-6">
                <p className="text-xl font-semibold text-primary-700 text-center italic">
                  "Treat every client like family."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-white">
            Ready to empower more families through technology?
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Join as a member, become a specialist, or partner with HITS to deliver concierge support at scale.
          </motion.p>
          <motion.div {...fadeUp(0.2)} className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                Become a member
              </Button>
            </Link>
            <Link href="/enterprise-services">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                See enterprise concierge
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

