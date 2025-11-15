"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const libraryCategories = [
  {
    title: "Essential Guides",
    description: "Plain-language tutorials covering email, messaging, browsing, and smart devices.",
    items: ["Email mastery series", "Video chat starter kit", "Smartphone basics"],
  },
  {
    title: "Safety & Security",
    description: "Programs that help members spot scams, protect passwords, and browse confidently.",
    items: ["Scam response workshop", "Digital hygiene checklist", "Safe online banking course"],
  },
  {
    title: "Daily Life Apps",
    description: "Step-by-step walkthroughs for telehealth, grocery delivery, rideshares, and more.",
    items: ["Telehealth in 20 minutes", "Photo organizing lab", "Smart home setup"],
  },
];

const upcomingEvents = [
  { title: "Fraud Watch Live", date: "May 6", format: "Virtual workshop", focus: "Spotting phone & email scams" },
  { title: "Telehealth Confidence Clinic", date: "May 15", format: "Small group (NYC)", focus: "Preparing for doctor visits online" },
  { title: "Caregiver Tech Toolkit", date: "May 22", format: "Virtual series", focus: "Organizing schedules & medications" },
];

const resourceHighlights = [
  {
    title: "Weekly Tip Sheet",
    copy: "Concise, printable advice to keep members current with new features and privacy changes.",
  },
  {
    title: "Knowledge Base",
    copy: "Search hundreds of visual guides written in large type with screenshots and captions.",
  },
  {
    title: "Office Hours",
    copy: "Drop-in video sessions where specialists answer questions and demonstrate tasks live.",
  },
];

const faqs = [
  {
    q: "Do I need to be a HITS member to access resources?",
    a: "Members receive full access to guides, classes, and recordings. We offer select resources free for caregivers and community partners.",
  },
  {
    q: "Are materials accessible for low-vision users?",
    a: "Yes. All downloads include large-type PDFs, closed captions, and high-contrast slides. We also support screen readers.",
  },
  {
    q: "Can I request a custom tutorial?",
    a: "Absolutely. Submit a topic request and our curriculum team will schedule it in an upcoming release cycle.",
  },
];

export default function ResourcesPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeIn}
            className="text-sm uppercase tracking-[0.35em] text-primary-500 font-semibold"
          >
            Resource Library
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeIn}
            className="mt-6 text-[38px] md:text-[50px] font-extrabold leading-tight text-primary-900"
          >
            Tutorials, workshops, and tools designed for confident technology use.
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeIn}
            className="mt-6 text-lg leading-8 text-text-secondary"
          >
            Explore the HITS How-To hub—hundreds of guides, live sessions, and printable checklists curated for older
            adults, caregivers, and community partners.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fadeIn}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                Unlock full library
              </Button>
            </Link>
            <Link href="#schedule">
              <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                View upcoming events
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18 grid gap-10">
          {libraryCategories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
              custom={idx}
              className="rounded-3xl border border-secondary-200 bg-white p-8 shadow-soft"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-semibold text-primary-700">{category.title}</h2>
                  <p className="mt-3 text-base leading-7 text-text-secondary">{category.description}</p>
                </div>
                <div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="schedule" className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={0}
            className="text-[30px] md:text-[38px] font-bold text-center text-primary-700"
          >
            Upcoming events
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, idx) => (
              <motion.article
                key={event.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
                custom={idx * 0.15}
                className="rounded-3xl border border-secondary-200 bg-secondary-50 p-6 shadow-soft"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-400">{event.date}</p>
                <h3 className="mt-3 text-xl font-semibold text-primary-700">{event.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{event.format}</p>
                <p className="mt-3 text-base leading-7 text-text-secondary">{event.focus}</p>
                <div className="mt-5">
                  <Button variant="secondary" className="w-full h-11 bg-secondary-200 text-primary-700 hover:bg-secondary-300">
                    Reserve seat
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18 grid grid-cols-1 md:grid-cols-3 gap-8">
          {resourceHighlights.map((resource, idx) => (
            <motion.div
              key={resource.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
              custom={idx * 0.1}
              className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-soft"
            >
              <h3 className="text-lg font-semibold text-primary-700">{resource.title}</h3>
              <p className="mt-3 text-base leading-7 text-text-secondary">{resource.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={0}
            className="text-[28px] md:text-[36px] font-bold text-center text-primary-700"
          >
            Frequently asked questions
          </motion.h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq, idx) => (
              <motion.details
                key={faq.q}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
                custom={idx * 0.12}
                className="group rounded-3xl border border-secondary-200 bg-secondary-50 p-6 shadow-soft"
              >
                <summary className="cursor-pointer text-lg font-semibold text-primary-700 marker:content-[''] flex items-center justify-between">
                  {faq.q}
                  <span className="ml-4 text-primary-500 transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-4 text-base leading-7 text-text-secondary">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            custom={0}
            className="text-[30px] md:text-[38px] font-bold text-white"
          >
            Bring HITS learning to your community
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeIn}
            custom={0.12}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Partner with us for co-branded workshops, resource kiosks, and fully managed concierge programs.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeIn}
            custom={0.2}
            className="mt-6 flex flex-wrap justify-center gap-4"
          >
            <Link href="/enterprise-services">
              <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                Enterprise concierge
              </Button>
            </Link>
            <Link href="/consumer-services">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                Join as a member
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

