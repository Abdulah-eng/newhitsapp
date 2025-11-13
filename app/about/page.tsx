"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});


export default function AboutPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-20 lg:py-28">
          <motion.div {...fadeUp(0)} className="text-center max-w-4xl mx-auto">
            <p className="text-sm font-semibold tracking-[0.3em] text-primary-500 uppercase">About HITS</p>
            <h1 className="mt-6 text-[40px] md:text-[52px] font-extrabold leading-tight text-primary-900">
              About HITS – Hire I.T. Specialist
            </h1>
            <p className="mt-4 text-base md:text-lg text-primary-600 italic">
              We hit the mark with care, connection, and technology.
            </p>
            <p className="mt-6 text-lg text-text-secondary leading-8">
              HITS – Hire I.T. Specialist exists to make technology feel safe, simple, and human for older adults, disabled adults, and the people who love them.
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
            className="mt-6 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary"
          >
            Our vision is a world where older adults and disabled adults feel confident and independent online, caregivers feel supported, and families stay connected without tech getting in the way.
          </motion.p>
        </div>
      </section>

      {/* How HITS Works Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            How HITS Works
          </motion.h2>
          <div className="mt-12 space-y-6 max-w-3xl mx-auto">
            {[
              { step: "1", text: "Share what you need help with." },
              { step: "2", text: "Get matched with a vetted I.T. specialist." },
              { step: "3", text: "Choose a time and see your cost upfront." },
              { step: "4", text: "Get one-on-one help and a clear visit summary." },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                {...fadeUp(0.1 + idx * 0.1)}
                className="flex items-start gap-4 p-6 rounded-2xl border border-secondary-200 bg-secondary-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-lg text-text-secondary pt-2">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Who We Serve
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Older adults living on their own or with family",
              "Disabled adults and people with accessibility needs",
              "Adult children and caregivers supporting loved ones",
              "Families wanting a long-term, trusted tech helper",
              "Organizations serving seniors, disabled adults, and other vulnerable populations",
            ].map((item, idx) => (
              <motion.div
                key={item}
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

      {/* Meet Our Founder Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Meet Our Founder
          </motion.h2>
          <motion.div
            {...fadeUp(0.1)}
            className="mt-12 rounded-3xl border border-secondary-200 bg-secondary-50 p-8 md:p-12 shadow-soft"
          >
            <h3 className="text-2xl font-bold text-primary-700 mb-4">Shawn Thomas, Founder & Lead I.T. Specialist</h3>
            <div className="space-y-4 text-base leading-7 text-text-secondary">
              <p>
                Shawn is a disabled, retired U.S. Army veteran with 4 combat tours and a lifelong commitment to service. After leaving the military, he earned a Bachelor of Arts with a major in Organizational Management and a degree in Computer Information Technology, concentrating in Cybersecurity, Information Assurance, and Business Information Systems.
              </p>
              <p>
                Over the years, Shawn has been the "tech person" for his unit, his family, and his community; fixing laptops, cleaning viruses, recovering photos, setting up devices, and explaining technology in plain language. After watching too many older adults and disabled adults get rushed, talked down to, or overcharged, he created HITS – Hire I.T. Specialist with a simple promise:
              </p>
              <div className="bg-white rounded-2xl p-6 border border-primary-200 my-6">
                <p className="text-xl font-semibold text-primary-700 text-center italic">
                  "Treat Every Client Like Family"
                </p>
              </div>
              <p>
                HITS is built on three priorities:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Care first</li>
                <li>Clear communication</li>
                <li>Strong security</li>
              </ul>
              <p>
                As a disabled, retired U.S. Army veteran with 4 combat tours, Shawn understands what it feels like to rely on systems you can't fully control and the importance of trust, discipline, and protection. HITS exists to give seniors, disabled adults, and their families calm, trustworthy, one-on-one tech support; whether that's at the kitchen table or over a secure video call.
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      <section className="bg-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold">
            Ready to empower more families through technology?
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Join as a member, become a specialist, or partner with HITSapp to deliver concierge support at scale.
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
    </main>
  );
}

