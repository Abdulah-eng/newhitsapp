"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

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
  const { user } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin" || user.email?.toLowerCase() === "admin@hitspecialist.com") {
      return "/admin/dashboard";
    }
    if (user.role === "senior") {
      return "/senior/dashboard";
    }
    if (user.role === "specialist") {
      return "/specialist/dashboard";
    }
    return "/login";
  };

  return (
    <main className="min-h-screen bg-secondary-100 text-text-primary">
      {/* Header (matched spacing/scale) */}
      <header className="z-40 bg-white">
        <div className="w-full px-4 sm:px-6 md:px-10">
          <div className="flex items-center justify-between gap-4 sm:gap-6 md:gap-8 py-4 sm:py-6 md:py-8">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-primary-500 flex items-center justify-center bg-white shadow-soft">
                <span className="text-primary-600 font-extrabold text-sm sm:text-base md:text-xl">H</span>
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-primary-600 tracking-tight">HITS</p>
                <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">Hire IT Specialists</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex flex-1 flex-nowrap items-center justify-center gap-6 text-[17px] font-semibold text-primary-900 whitespace-nowrap">
              <Link href="/about" className="hover:text-primary-600 transition-colors">About</Link>
              <Link href="/for-seniors-families" className="hover:text-primary-600 transition-colors">For Seniors & Families</Link>
              <Link href="/for-partners" className="hover:text-primary-600 transition-colors">For Partners</Link>
              <Link href="/resources" className="hover:text-primary-600 transition-colors">Resources</Link>
              <Link href="/plans" className="hover:text-primary-600 transition-colors">Pricing & Plans</Link>
              <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact / Support</Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/specialists">
                <Button
                  size="lg"
                  variant="ghost"
                  className="px-6 h-12 text-[16px] text-primary-700 hover:text-primary-600"
                >
                  Find Specialist
                </Button>
              </Link>
              {user ? (
                <Link href={getDashboardLink()}>
                  <Button
                    size="lg"
                    className="px-6 h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="px-6 h-12 text-[16px] text-primary-700 hover:text-primary-600"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="px-6 h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-6">
              <nav className="grid gap-3 text-[18px] font-semibold text-primary-900">
                <Link onClick={() => setMobileOpen(false)} href="/about" className="py-2 hover:text-primary-600">About</Link>
                <Link onClick={() => setMobileOpen(false)} href="/for-seniors-families" className="py-2 hover:text-primary-600">For Seniors & Families</Link>
                <Link onClick={() => setMobileOpen(false)} href="/for-partners" className="py-2 hover:text-primary-600">For Partners</Link>
                <Link onClick={() => setMobileOpen(false)} href="/resources" className="py-2 hover:text-primary-600">Resources</Link>
                <Link onClick={() => setMobileOpen(false)} href="/plans" className="py-2 hover:text-primary-600">Pricing & Plans</Link>
                <Link onClick={() => setMobileOpen(false)} href="/contact" className="py-2 hover:text-primary-600">Contact / Support</Link>
              </nav>
              <div className="mt-4 space-y-3">
                <Link onClick={() => setMobileOpen(false)} href="/specialists" className="block">
                  <Button variant="ghost" className="w-full h-12 text-[16px] text-primary-700 hover:text-primary-600">
                    Find Specialist
                  </Button>
                </Link>
                {user ? (
                  <Link onClick={() => setMobileOpen(false)} href={getDashboardLink()} className="block">
                    <Button className="w-full h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link onClick={() => setMobileOpen(false)} href="/login" className="block">
                      <Button variant="ghost" className="w-full h-12 text-[16px] text-primary-700 hover:text-primary-600">
                        Sign In
                      </Button>
                    </Link>
                    <Link onClick={() => setMobileOpen(false)} href="/register" className="block">
                      <Button className="w-full h-12 text-[16px] bg-primary-600 text-white hover:bg-primary-700">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 text-center">
          <motion.div variants={staggerChildren} className="max-w-4xl mx-auto">
            <motion.h1
              variants={fadeUp(0)}
              className="text-[42px] md:text-[56px] font-extrabold leading-tight text-primary-700"
            >
              Trusted tech help for seniors, disabled adults, and families.
            </motion.h1>
            <motion.p
              variants={fadeUp(0.05)}
              className="mt-4 text-base md:text-lg text-primary-600 italic max-w-2xl mx-auto"
            >
              We hit the mark with care, connection, and technology.
            </motion.p>
            <motion.p
              variants={fadeUp(0.1)}
              className="mt-6 text-[18px] md:text-[20px] leading-8 text-text-secondary max-w-3xl mx-auto"
            >
              HITS – Hire I.T. Specialist connects older adults, disabled adults, and caregivers with patient, vetted tech professionals for in-home and remote support. We focus on clear communication, fair pricing, and strong security so technology feels safe, not overwhelming.
            </motion.p>
            <motion.div
              variants={fadeUp(0.2)}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link href="/senior/book-appointment">
                <motion.div whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(44,95,141,0.18)" }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="h-12 px-8 text-[16px] bg-primary-500 hover:bg-primary-600">Book a Visit</Button>
                </motion.div>
              </Link>
              <Link href="/for-seniors-families">
                <motion.div whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(74,155,142,0.2)" }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 text-[16px] bg-secondary-200 text-primary-700 hover:bg-secondary-300"
                  >
                    Learn How HITS Works
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* How HITS Works Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-secondary-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[36px] md:text-[48px] font-extrabold text-primary-700 text-center">
            How HITS Works
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                step: "1",
                title: "Tell us what you need",
                description: "You tell us what you need help with (phone, tablet, computer, TV, Wi-Fi, scams, apps, and more).",
              },
              {
                step: "2",
                title: "Get matched",
                description: "We match you with a background checked, patient I.T. specialist.",
              },
              {
                step: "3",
                title: "Choose time & see cost",
                description: "You choose a time that works for you and see your visit cost upfront.",
              },
              {
                step: "4",
                title: "Get one-on-one help",
                description: "You receive one-on-one help in your home or remotely, plus a clear receipt after each visit.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                variants={fadeUp(0.1 + idx * 0.1)}
                className="bg-white rounded-2xl border border-secondary-200 p-6 shadow-soft text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-primary-700 mb-3">{item.title}</h3>
                <p className="text-base text-text-secondary leading-6">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Problems We Solve Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[36px] md:text-[48px] font-extrabold text-primary-700 text-center mb-4">
            Problems HITS Solves
          </motion.h2>
          <motion.p variants={fadeUp(0.05)} className="text-center text-text-secondary text-lg max-w-3xl mx-auto mb-12">
            Stop missing out on technology. Use HITS to get the help you need, when you need it.
          </motion.p>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                title: "Device Setup",
                description: "Phones, tablets, computers, smart TVs",
                img: "/images/device-setup.jpg",
              },
              {
                title: "Wi-Fi & Network",
                description: "Router and printer issues",
                img: "/images/wifi.jpg",
              },
              {
                title: "Account Recovery",
                description: "Email and online accounts, password resets",
                img: "/images/account-recovery.webp",
              },
              {
                title: "Video Calls",
                description: "Connect with family, friends, and doctors",
                img: "/images/video-call.avif",
              },
              {
                title: "Telehealth",
                description: "Online appointments and portals",
                img: "/images/telehealth.webp",
              },
              {
                title: "Safety & Security",
                description: "Scam and fraud safety checks",
                img: "/images/sixth.jpg",
              },
              {
                title: "File Organization",
                description: "Organizing photos and files",
                img: "/images/file-organization.jpg",
              },
              {
                title: "App Training",
                description: "Basic training on everyday apps and websites",
                img: "/images/app-training.jpg",
              },
            ].map((problem, idx) => (
              <motion.div
                key={problem.title}
                variants={fadeUp(0.05 + idx * 0.05)}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                className="flex flex-col rounded-2xl border border-secondary-200 bg-white shadow-soft overflow-hidden"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img 
                    src={problem.img} 
                    alt={problem.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary-700 mb-2">{problem.title}</h3>
                  <p className="text-base text-text-secondary leading-6">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Who HITS Is For Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-secondary-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[36px] md:text-[48px] font-extrabold text-primary-700 text-center mb-4">
            Who HITS Is For
          </motion.h2>
          <motion.p variants={fadeUp(0.05)} className="text-center text-text-secondary text-lg max-w-3xl mx-auto mb-12">
            HITS serves everyone who needs patient, respectful tech support.
          </motion.p>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Seniors",
                description: "Patient, one-on-one help tailored to your pace",
                img: "/images/seniors.jpg",
              },
              {
                title: "Disabled Adults",
                description: "Accessible, paced support that respects your needs",
                img: "/images/disabled-adults.jpg",
              },
              {
                title: "Caregivers",
                description: "Peace of mind knowing your loved ones have tech support",
                img: "/images/care-giver.jpg",
              },
              {
                title: "Families",
                description: "A trusted \"tech person\" you can call anytime",
                img: "/images/second.png",
              },
              {
                title: "Communities & Partners",
                description: "Support for organizations serving seniors and disabled adults",
                img: "/images/first.webp",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                variants={fadeUp(0.1 + idx * 0.1)}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                className="flex flex-col rounded-2xl border border-secondary-200 bg-white shadow-soft overflow-hidden"
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-extrabold text-white drop-shadow-lg">{item.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-base text-text-secondary leading-6">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Trust & Safety Callout Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-primary-700 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[36px] md:text-[48px] font-extrabold text-center mb-8 text-white">
            Trust & Safety
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              "Background checked specialists",
              "Simple, transparent pricing",
              "No high-pressure sales or unnecessary upsells",
              "Secure payment processing",
            ].map((item, idx) => (
              <motion.div
                key={item}
                variants={fadeUp(0.1 + idx * 0.1)}
                className="bg-white/10 rounded-xl border border-white/20 p-6 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-white flex-shrink-0" />
                  <p className="text-base text-white/90 leading-6">{item}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[40px] md:text-[48px] font-extrabold text-primary-600 text-center">
            What HITS Does
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start"
          >
            {[
              {
                title: (
                  <>
                    Remote Lessons &<br />Support
                  </>
                ),
                img: "/images/fifth.jpg",
                alt: "Remote Lessons & Support",
              },
              {
                title: (
                  <>
                    Library of On‑Demand How To<br />Guides & Videos
                  </>
                ),
                img: "/images/liberty.webp",
                alt: "On-Demand Guides & Videos",
              },
              {
                title: (
                  <>
                    Group Lessons
                  </>
                ),
                img: "/images/fourth.jpg",
                alt: "Group Lessons",
              },
              {
                title: (
                  <>
                    In-Home Tech Support
                  </>
                ),
                img: "/images/inhome.jpg",
                alt: "In-Home Tech Support",
              },
              {
                title: (
                  <>
                    Device Setup &<br />Configuration
                  </>
                ),
                img: "/images/device-setup.jpg",
                alt: "Device Setup & Configuration",
              },
              {
                title: (
                  <>
                    Security &<br />Safety Training
                  </>
                ),
                img: "/images/sixth.jpg",
                alt: "Security & Safety Training",
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[40px] md:text-[48px] font-extrabold text-primary-600 text-center">
            I need HITS for…
          </motion.h2>
          <motion.div
            variants={staggerChildren}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              {
                title: "Myself",
                img: "/images/third.jpg",
                description: "Get the help you need right now.",
              },
              {
                title: "My loved ones",
                img: "/images/second.png",
                description: "Give the help your loved ones need.",
              },
              {
                title: "My residents, clients & members",
                img: "/images/fourth.jpg",
                description:
                  "Learn how HITS supports senior communities, health plans, and social service organizations.",
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp(0.12)}
                whileHover={{ y: -12, boxShadow: "0 18px 36px rgba(44,95,141,0.16)" }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="flex flex-col rounded-2xl overflow-hidden border border-secondary-200 shadow-soft bg-white"
              >
                <div className="relative w-full h-64 md:h-80 overflow-hidden">
                  <img 
                    src={card.img} 
                    alt={card.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary-900/40 flex items-center justify-center">
                    <span className="text-white text-[28px] md:text-[32px] font-extrabold text-center drop-shadow-lg px-4">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <motion.h2 variants={fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-600">
            Why HITS?
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 sm:gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <h4 className="text-[20px] font-extrabold text-primary-700">HITS</h4>
              <ul className="mt-4 space-y-2 text-[16px]">
                <li><Link href="/consumer-services" className="hover:text-primary-500">Consumers</Link></li>
                <li><Link href="/enterprise-services" className="hover:text-primary-500">Enterprises</Link></li>
                <li><Link href="/news" className="hover:text-primary-500">In the News</Link></li>
                <li><Link href="/howto-offerings" className="hover:text-primary-500">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[20px] font-extrabold text-primary-700">Team</h4>
              <ul className="mt-4 space-y-2 text-[16px]">
                <li><Link href="/about" className="hover:text-primary-500">About</Link></li>
                <li><Link href="/for-partners" className="hover:text-primary-500">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[20px] font-extrabold text-primary-700">Support</h4>
              <ul className="mt-4 space-y-2 text-[16px]">
                <li>
                  <a 
                    href="https://candoo.screenconnect.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-primary-500"
                    title="Remote technical support for HITS members"
                  >
                    Member Support (Remote Help)
                  </a>
                </li>
                <li><Link href="/faq" className="hover:text-primary-500">FAQ</Link></li>
                <li><Link href="/safety" className="hover:text-primary-500">Safety &amp; Security</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-500">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-500">Terms of Use</Link></li>
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
            <form 
              className="mt-6 space-y-4" 
              onSubmit={async (e) => {
                e.preventDefault();
                setNewsletterLoading(true);
                setNewsletterMessage(null);

                try {
                  const response = await fetch("/api/newsletter/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: newsletterEmail }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    setNewsletterMessage({ type: "error", text: data.error || "Failed to subscribe. Please try again." });
                  } else {
                    setNewsletterMessage({ type: "success", text: data.message || "Successfully subscribed!" });
                    setNewsletterEmail("");
                    // Clear success message after 5 seconds
                    setTimeout(() => setNewsletterMessage(null), 5000);
                  }
                } catch (error: any) {
                  console.error("Newsletter subscription error:", error);
                  setNewsletterMessage({ type: "error", text: "An error occurred. Please try again later." });
                } finally {
                  setNewsletterLoading(false);
                }
              }}
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email Address"
                disabled={newsletterLoading}
                className="w-full h-12 px-4 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-secondary-100 disabled:cursor-not-allowed"
              />
              {newsletterMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    newsletterMessage.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-error-50 border border-error-200 text-error-700"
                  }`}
                >
                  {newsletterMessage.text}
                </div>
              )}
              <Button 
                type="submit"
                className="w-full h-12 bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={newsletterLoading}
              >
                {newsletterLoading ? "SUBSCRIBING..." : "SUBMIT"}
              </Button>
            </form>
          </div>
        </div>
        <div className="border-t border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center gap-4 text-[14px]">
                <Link href="/terms" className="text-text-secondary hover:text-primary-500">Terms & Conditions</Link>
                <span className="text-text-secondary">•</span>
                <Link href="/privacy" className="text-text-secondary hover:text-primary-500">Privacy Policy</Link>
                <span className="text-text-secondary">•</span>
                <Link href="/safety" className="text-text-secondary hover:text-primary-500">Safety & Security</Link>
                <span className="text-text-secondary">•</span>
                <Link href="/contact" className="text-text-secondary hover:text-primary-500">Contact & Support</Link>
              </div>
              <p className="text-[14px] text-text-secondary text-center">
                © {new Date().getFullYear()} HITS – Hire I.T. Specialist. All rights reserved. HITS is not a 911 or emergency service and does not provide financial, legal, or medical advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
