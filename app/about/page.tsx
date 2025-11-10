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

const stats = [
  { label: "Members served", value: "32K+" },
  { label: "Average satisfaction", value: "4.9/5" },
  { label: "Certified specialists", value: "650+" },
  { label: "Response time", value: "< 2 min" },
];

const pillars = [
  {
    title: "Empathy First",
    description:
      "We listen before we troubleshoot. Every interaction starts with understanding the member’s comfort level and goals.",
  },
  {
    title: "Security Built In",
    description:
      "Background-checked specialists, secure remote tools, and clear consent steps make staying safe online effortless.",
  },
  {
    title: "Learning for Life",
    description:
      "From live coaching to library guides, HITSapp ensures members keep growing and stay confident with technology.",
  },
];

const timeline = [
  { year: "2018", title: "The idea is born", copy: "A small group of IT trainers partner with senior centers across New York to pilot concierge tech support." },
  { year: "2019", title: "HITSapp launches", copy: "Our first nationwide membership plans roll out with live remote assistance and guided lessons." },
  { year: "2021", title: "Enterprise concierge", copy: "Healthcare groups, senior living communities, and banking partners start offering HITSapp to their customers." },
  { year: "2024", title: "AI-powered guidance", copy: "We introduce AI match tools to pair members with ideal specialists and surface the right resources instantly." },
];

export default function AboutPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-sm font-semibold tracking-[0.3em] text-primary-500 uppercase">About HITSapp</p>
            <h1 className="mt-6 text-[40px] md:text-[52px] font-extrabold leading-tight text-primary-900">
              Building trusted technology care for older adults and caregivers.
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-8">
              HITSapp makes technology feel human. We provide friendly specialists, clear coaching, and safety-first tools
              so every member can stay connected, informed, and independent in the digital world.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Meet the specialists
              </Button>
              <Link href="/consumer-services">
                <Button size="lg" variant="secondary" className="h-12 px-6 bg-secondary-200 text-primary-700 hover:bg-secondary-300">
                  Explore services
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="relative rounded-3xl border border-secondary-200 bg-gradient-to-br from-white via-secondary-50 to-secondary-200 p-1 shadow-large"
          >
            <div className="rounded-[28px] bg-white px-8 py-10">
              <p className="text-text-secondary leading-relaxed">
                “We built HITSapp to be the calm voice on the other end of the screen—ready to teach, troubleshoot, and cheer on every small win.”
              </p>
              <div className="mt-6">
                <p className="text-primary-700 font-semibold">Maya Richards</p>
                <p className="text-sm text-text-tertiary">Co-founder & Chief Care Officer</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 hidden lg:block">
              <div className="bg-primary-500 text-white rounded-2xl px-6 py-4 shadow-medium">
                <p className="text-sm uppercase tracking-wide opacity-80">Member Highlight</p>
                <p className="mt-2 text-lg font-semibold">“I finally joined my granddaughter’s livestream!”</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-16">
          <motion.div {...fadeUp(0)} className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((item, idx) => (
              <motion.div
                key={item.label}
                {...fadeUp(idx * 0.1)}
                className="rounded-2xl bg-white border border-secondary-200 shadow-soft px-6 py-8 text-center"
              >
                <p className="text-3xl font-extrabold text-primary-600">{item.value}</p>
                <p className="mt-2 text-sm text-text-secondary uppercase tracking-[0.2em]">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Caring is our culture
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="mt-4 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary"
          >
            Our team blends hospitality, clinical expertise, and digital innovation. We recruit educators, nurses, IT
            professionals, and multilingual specialists who are passionate about coaching with patience.
          </motion.p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                {...fadeUp(0.1 + idx * 0.1)}
                className="rounded-2xl border border-secondary-200 bg-secondary-50 p-8 shadow-soft"
              >
                <h3 className="text-xl font-semibold text-primary-700">{pillar.title}</h3>
                <p className="mt-4 text-base leading-7 text-text-secondary">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fadeUp(0)} className="text-[32px] md:text-[38px] font-bold text-primary-700 text-center">
            Our journey so far
          </motion.h2>
          <div className="mt-12 grid gap-10">
            {timeline.map((event, idx) => (
              <motion.div
                key={event.year}
                {...fadeUp(idx * 0.12)}
                className="relative rounded-2xl border border-secondary-200 bg-white px-8 py-6 shadow-soft"
              >
                <span className="text-sm font-semibold tracking-[0.4em] uppercase text-accent-400">{event.year}</span>
                <h3 className="mt-2 text-2xl font-bold text-primary-800">{event.title}</h3>
                <p className="mt-3 text-base text-text-secondary leading-7">{event.copy}</p>
                <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full border-4 border-white bg-primary-500 shadow-medium" />
              </motion.div>
            ))}
          </div>
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

