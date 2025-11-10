"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const loopFloat = {
  animate: {
    y: [0, -12, 0],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1] as const,
  },
};

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-secondary-100 text-text-primary">
      {/* Header (matched spacing/scale) */}
      <header className="z-40 bg-white">
        <div className="max-w-7xl mx-auto px-14 md:px-18">
          <div className="flex items-center justify-between py-8 md:py-10">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-4 border-primary-500 flex items-center justify-center bg-white shadow-soft">
                <span className="text-primary-600 font-extrabold text-xl">H</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-primary-600 tracking-tight">HITSapp</p>
                <p className="text-sm text-text-secondary">Hire IT Specialists</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-7 text-[18px] font-semibold text-primary-900">
              <Link href="/about" className="hover:text-primary-600 transition-colors">About</Link>
              <Link href="/consumer-services" className="hover:text-primary-600 transition-colors">Consumers</Link>
              <Link href="/enterprise-services" className="hover:text-primary-600 transition-colors">Enterprises</Link>
              <Link href="/howto-offerings" className="hover:text-primary-600 transition-colors">Resources</Link>
              <Link href="/plans" className="hover:text-primary-600 transition-colors">Plans</Link>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-5">
              <a href="https://candoo.screenconnect.com" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-7 h-13 text-[16px] bg-accent-400 text-white hover:bg-accent-500"
                >
                  Member Support
                </Button>
              </a>
              <Link href="/login" className="text-[18px] font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Sign in
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-md border border-secondary-300 text-text-primary"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white">
            <div className="max-w-7xl mx-auto px-12 md:px-16 py-6">
              <nav className="grid gap-3 text-[18px] font-semibold text-primary-900">
                <Link onClick={() => setMobileOpen(false)} href="/about" className="py-2 hover:text-primary-600">About</Link>
                <Link onClick={() => setMobileOpen(false)} href="/consumer-services" className="py-2 hover:text-primary-600">Consumers</Link>
                <Link onClick={() => setMobileOpen(false)} href="/enterprise-services" className="py-2 hover:text-primary-600">Enterprises</Link>
                <Link onClick={() => setMobileOpen(false)} href="/howto-offerings" className="py-2 hover:text-primary-600">Resources</Link>
                <Link onClick={() => setMobileOpen(false)} href="/plans" className="py-2 hover:text-primary-600">Plans</Link>
              </nav>
              <div className="mt-4 flex items-center gap-3">
                <a
                  onClick={() => setMobileOpen(false)}
                  href="https://candoo.screenconnect.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full h-12 text-[16px] bg-accent-400 text-white hover:bg-accent-500" variant="secondary">
                    Member Support
                  </Button>
                </a>
                <Link onClick={() => setMobileOpen(false)} href="/login" className="flex-1">
                  <Button className="w-full h-12 text-[16px] text-primary-600 hover:text-primary-500" variant="ghost">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero (matched scale/spacing) */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="relative overflow-hidden bg-white"
      >
        <motion.div
          className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary-200 opacity-40 blur-3xl"
          {...loopFloat}
        />
        <motion.div
          className="pointer-events-none absolute bottom-10 -left-24 h-64 w-64 rounded-full bg-accent-200 opacity-30 blur-3xl"
          {...loopFloat}
          transition={{ ...loopFloat.transition, duration: 8 }}
        />
        <div className="relative max-w-7xl mx-auto px-12 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-0 md:pt-0 pb-12 md:pb-16">
          <motion.div variants={staggerChildren}>
            <motion.h1
              variants={fadeUp(0)}
              className="text-[42px] md:text-[56px] font-extrabold leading-tight text-primary-700"
            >
              We make technology easy.
            </motion.h1>
            <motion.p
              variants={fadeUp(0.1)}
              className="mt-5 text-[18px] leading-8 text-text-secondary max-w-2xl"
            >
              Friendly support and training tailored for older adults so you can feel comfortable
              with your phone, computer, tablet, and more — safely, affordably, and from home.
            </motion.p>
            <motion.div
              variants={fadeUp(0.2)}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/register">
                <motion.div whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(44,95,141,0.18)" }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="h-12 px-6 text-[15px] bg-primary-500 hover:bg-primary-600">Consumers</Button>
                </motion.div>
              </Link>
              <Link href="/register?role=specialist">
                <motion.div whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(74,155,142,0.2)" }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-6 text-[15px] bg-secondary-200 text-primary-700 hover:bg-secondary-300"
                  >
                    Enterprises
                  </Button>
                </motion.div>
              </Link>
              <Link href="#contact">
                <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 px-6 text-[15px] text-primary-600 hover:text-primary-500"
                  >
                    Contact us
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div
              variants={fadeUp(0.3)}
              className="mt-4 text-[14px] text-text-secondary flex items-center gap-3"
            >
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
              Trusted, remote support by vetted HITSapp specialists—tailored for seniors and caregivers.
            </motion.div>
          </motion.div>
          <motion.div variants={fadeIn(0.2)} className="relative">
            {/* Dummy video/image */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
              className="aspect-video rounded-xl overflow-hidden shadow-large border border-secondary-200 bg-secondary-100"
            >
              <video
                className="w-full h-full object-cover"
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                poster="https://placehold.co/1200x675/png?text=Tech+Concierge+Demo"
                controls
              />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -left-6 hidden md:block"
              animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const }}
            >
              <img
                src="https://placehold.co/180x180/jpg?text=Friendly+Support"
                alt="Friendly Support"
                className="rounded-lg shadow-medium border border-secondary-200"
              />
            </motion.div>
            <motion.div
              className="absolute top-6 -right-8 hidden lg:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const }}
            >
              <div className="rounded-2xl bg-white px-5 py-4 shadow-soft border border-secondary-200">
                <p className="text-xs uppercase tracking-[0.35em] text-primary-500">Live now</p>
                <p className="mt-2 text-sm font-semibold text-primary-700">
                  Getting started with telehealth
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Safety strip */}
      {/* Security CTA (large center heading + subcopy) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-20 text-center">
          <motion.h2 variants={fadeUp(0)} className="text-[36px] md:text-[56px] font-extrabold leading-tight text-primary-600">
            Your safety and security is our<br className="hidden md:block" /> top priority.
          </motion.h2>
          <motion.p variants={fadeUp(0.12)} className="mt-8 text-[20px] md:text-[24px] text-text-primary">
            Give us a call at{" "}
            <span className="font-extrabold tracking-wide text-primary-600">646‑758‑6606</span>{" "}
            or email{" "}
            <a className="font-extrabold text-accent-400 underline" href="mailto:support@hitsapp.com">
              support@hitsapp.com
            </a>{" "}
            to get started.
          </motion.p>
        </div>
      </motion.section>

      {/* What We Do */}
      <motion.section
        id="what-we-do"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[40px] md:text-[48px] font-extrabold text-primary-600 text-center">
            What We Do
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 items-start"
          >
            {[
              {
                title: (
                  <>
                    Remote Lessons &<br />Support
                  </>
                ),
                img: "https://placehold.co/520x320/png?text=Remote+Lessons+%26+Support",
                alt: "Remote Lessons & Support",
              },
              {
                title: (
                  <>
                    Library of On‑Demand How To<br />Guides & Videos
                  </>
                ),
                img: "https://placehold.co/520x320/png?text=On-Demand+Guides+%26+Videos",
                alt: "On-Demand Guides & Videos",
              },
              {
                title: (
                  <>
                    Group Lessons
                  </>
                ),
                img: "https://placehold.co/520x320/png?text=Group+Lessons",
                alt: "Group Lessons",
              },
            ].map((item, idx) => (
              <motion.div
                key={typeof item.title === "string" ? item.title : idx}
                variants={fadeUp(0.1 + idx * 0.05)}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                className="flex flex-col items-center text-center rounded-2xl border border-secondary-200 bg-secondary-50/40 p-6 shadow-soft"
              >
                <img src={item.img} alt={item.alt} className="w-[320px] md:w-[360px] h-auto rounded-xl" />
                <h3 className="mt-6 text-[22px] font-extrabold text-primary-700 leading-snug">{item.title}</h3>
              </motion.div>
            ))}
          </motion.div>
          {/* Section CTAs */}
          <motion.div variants={fadeUp(0.25)} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/consumer-services" className="w-full sm:w-auto">
              <motion.div whileHover={{ y: -4, boxShadow: "0 14px 24px rgba(44,95,141,0.15)" }} whileTap={{ scale: 0.98 }}>
                <Button className="h-14 px-8 text-[16px] font-semibold rounded-xl bg-primary-500 hover:bg-primary-600">
                  Consumers learn more
                </Button>
              </motion.div>
            </Link>
            <Link href="/enterprise-services" className="w-full sm:w-auto">
              <motion.div whileHover={{ y: -4, boxShadow: "0 14px 24px rgba(74,155,142,0.18)" }} whileTap={{ scale: 0.98 }}>
                <Button className="h-14 px-8 text-[16px] font-semibold rounded-xl bg-accent-400 hover:bg-accent-500">
                  Enterprises learn more
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Personas CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="bg-white border-t border-b border-secondary-200"
      >
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[40px] md:text-[48px] font-extrabold text-primary-600 text-center">
            I need HITSapp for…
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              {
                title: "Myself",
                img: "https://placehold.co/640x420/jpg?text=Myself",
                description: "Get the help you need right now.",
              },
              {
                title: "My loved ones",
                img: "https://placehold.co/640x420/jpg?text=My+Loved+Ones",
                description: "Give the help your loved ones need.",
              },
              {
                title: "My residents, clients & members",
                img: "https://placehold.co/640x420/jpg?text=Residents+%26+Clients",
                description:
                  "Learn how HITSapp supports senior communities, health plans, and social service organizations.",
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp(0.12)}
                whileHover={{ y: -12, boxShadow: "0 18px 36px rgba(44,95,141,0.16)" }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="flex flex-col rounded-2xl overflow-hidden border border-secondary-200 shadow-soft bg-white"
              >
                <div className="relative w-full overflow-hidden rounded-xl">
                  <img src={card.img} alt={card.title} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-primary-900/30 flex items-center justify-center">
                    <span className="text-white text-[26px] md:text-[30px] font-extrabold text-center drop-shadow-lg">
                      {card.title}
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-left px-6 pb-6">
                  <p className="text-[18px] text-text-primary leading-7">{card.description}</p>
                  <motion.div whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 200 }}>
                    <Button className="mt-4 h-12 w-48 text-[16px] font-semibold rounded-xl bg-primary-500 hover:bg-primary-600">
                      Get Started
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Us */}
      <motion.section
        id="why"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-600">
            Why HITSapp?
          </motion.h2>
          <motion.p variants={fadeUp(0.1)} className="text-center text-text-secondary mt-3 max-w-3xl mx-auto text-[16px]">
            Secure, affordable, and tailored to older adults — delivered remotely by friendly, background‑checked specialists.
          </motion.p>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { title: "Safety First", desc: "100% remote support. We never access devices without permission.", icon: "🛡️" },
              { title: "Affordable", desc: "Membership options and a plan for every budget.", icon: "💳" },
              { title: "Here for You", desc: "Like a trusted friend, ready to help whenever you need it.", icon: "💬" },
            ].map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp(0.12)}
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-secondary-50 rounded-xl border border-secondary-200 p-6 shadow-soft"
              >
                <div className="text-3xl">{v.icon}</div>
                <h3 className="mt-3 font-semibold text-[18px]">{v.title}</h3>
                <p className="text-[14px] text-text-secondary mt-2">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-secondary-100"
      >
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center">
            What our members say
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { quote: "They helped me return an online order — so easy!", name: "Florence" },
              { quote: "Patient, kind, and explained everything clearly.", name: "George" },
              { quote: "Feel confident using my phone and computer now.", name: "Savita" },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp(0.1 + i * 0.08)}
                className="relative bg-white rounded-xl border border-secondary-200 p-6 shadow-soft overflow-hidden"
              >
                <motion.div
                  className="absolute top-4 right-4 text-primary-200"
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const }}
                >
                  ❝
                </motion.div>
                <p className="italic text-[16px] leading-7 relative z-10">“{t.quote}”</p>
                <p className="mt-4 text-[14px] text-text-secondary relative z-10">— {t.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Newsletter */}
      <motion.section
        id="resources"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-16 md:py-20">
          <motion.div variants={fadeUp(0)} className="max-w-3xl mx-auto text-center">
            <motion.h2 variants={fadeUp(0)} className="text-[32px] md:text-[40px] font-bold">
              Get free resources and up‑to‑date tips
            </motion.h2>
            <motion.p variants={fadeUp(0.12)} className="text-text-secondary mt-3 text-[16px]">
              Join our newsletter to get the latest news and how‑tos.
            </motion.p>
            <motion.form
              variants={fadeUp(0.22)}
              className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <motion.input
                whileFocus={{ boxShadow: "0 0 0 4px rgba(44,95,141,0.12)" }}
                type="email"
                required
                placeholder="Email Address"
                className="h-12 px-4 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 text-[15px]"
              />
              <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" size="lg" className="h-12 px-6 text-[15px]">
                  Subscribe
                </Button>
              </motion.div>
            </motion.form>
            <motion.p variants={fadeUp(0.32)} className="text-xs text-text-tertiary mt-3">
              We respect your privacy.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer id="contact" className="bg-secondary-100 border-t border-secondary-200">
        <div className="max-w-7xl mx-auto px-12 md:px-16 py-16 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <h4 className="text-[20px] font-extrabold text-primary-700">HITSapp</h4>
              <ul className="mt-4 space-y-2 text-[16px]">
                <li><Link href="/consumer-services" className="hover:text-primary-500">Consumers</Link></li>
                <li><Link href="/enterprise-services" className="hover:text-primary-500">Enterprises</Link></li>
                <li><Link href="#" className="hover:text-primary-500">In the News</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Customer Stories</Link></li>
                <li><Link href="/howto-offerings" className="hover:text-primary-500">Resources</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Media Kit</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Account Updates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[20px] font-extrabold text-primary-700">Team</h4>
              <ul className="mt-4 space-y-2 text-[16px]">
                <li><Link href="/about" className="hover:text-primary-500">About</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[20px] font-extrabold text-primary-700">Support</h4>
              <ul className="mt-4 space-y-2 text-[16px]">
                <li><a href="https://candoo.screenconnect.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500">Member Support</a></li>
                <li><Link href="#" className="hover:text-primary-500">FAQ</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Safety &amp; Security</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-500">Terms of Use</Link></li>
                <li><a href="mailto:support@hitsapp.com" className="hover:text-primary-500">support@hitsapp.com</a></li>
                <li className="font-extrabold text-primary-700">(646) 758-6606</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-soft border border-secondary-200">
            <h4 className="text-[24px] font-extrabold text-primary-700">Subscribe to our Newsletter</h4>
            <p className="mt-3 text-[15px] text-text-secondary">
              Join our newsletter to get the latest news and tips.
            </p>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full h-12 px-4 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <Button className="w-full h-12 bg-primary-600 text-white font-semibold hover:bg-primary-700">
                SUBMIT
              </Button>
            </form>
          </div>
        </div>
        <div className="border-t border-secondary-200">
          <div className="max-w-7xl mx-auto px-12 md:px-16 py-6 flex items-center justify-center">
            <p className="text-[14px] text-text-secondary">
              © {new Date().getFullYear()} HITSapp. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
