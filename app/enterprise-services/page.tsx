"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
});

const partnerLogos = ["SeniorLiving", "CareBridge", "HealthFirst", "BankSecure", "CityLibraries"];

const solutions = [
  {
    title: "Resident & Member Concierge",
    description:
      "Offer live, white-labeled HITS support under your brand. Our specialists act as an extension of your team, delivering secure remote assistance and proactive outreach.",
  },
  {
    title: "Digital Adoption Programs",
    description:
      "Launch multi-week learning pathways tailored to caregivers, policy holders, or community members. We supply curriculum, registration, and reporting.",
  },
  {
    title: "Risk & Compliance Safeguards",
    description:
      "Reduce digital fraud exposure with continuous scam monitoring, alert campaigns, and incident escalation handled by senior-friendly experts.",
  },
];

const metrics = [
  { label: "Average NPS", value: "+72" },
  { label: "Member issue resolution", value: "91% same-day" },
  { label: "Adoption uplift", value: "3.4× increase" },
  { label: "Care team hours saved", value: "28 hrs/wk" },
];

const programSteps = [
  {
    title: "Discover",
    copy: "We audit current touchpoints and conduct listening sessions with residents, caregivers, and staff to map the digital journey.",
  },
  {
    title: "Design",
    copy: "Co-create a concierge program with success metrics, tiered response playbooks, and accessibility-first content.",
  },
  {
    title: "Deploy",
    copy: "Launch in as little as four weeks with specialist training, branded portals, and communication kits.",
  },
  {
    title: "Delight",
    copy: "Track engagement dashboards, monthly insights, and continuous improvements powered by member feedback.",
  },
];

const resources = [
  { title: "Case Study: Telehealth Activation", description: "How a regional health plan drove 60% portal adoption in 90 days." },
  { title: "Guide: Designing Digital Confidence", description: "A blueprint for building tech support programs for older adults." },
  { title: "Webinar: Fraud Prevention Playbook", description: "Collaborative strategies to protect vulnerable members online." },
];

export default function EnterpriseServicesPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white">
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
          <motion.div {...fade(0)}>
            <p className="text-sm uppercase tracking-[0.35em] font-semibold text-white/70">Enterprise Services</p>
            <h1 className="mt-6 text-[38px] md:text-[50px] font-extrabold leading-tight">
              Concierge technology care for every resident, customer, and member.
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/90">
              HITS helps senior living communities, healthcare organizations, financial institutions, and libraries deliver
              human-centered digital support. We protect brand trust by empowering older adults to thrive online.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="mailto:support@hitsapp.com?subject=Enterprise%20Strategy%20Session">
                <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                  Schedule a strategy session
                </Button>
              </a>
              <Link href="/plans">
                <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                  View partnership tiers
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            {...fade(0.2)}
            className="rounded-3xl border border-white/30 bg-white/10 p-8 backdrop-blur-md shadow-large"
          >
            <h3 className="text-xl font-semibold text-white">Trusted by national partners</h3>
            <div className="mt-6 grid grid-cols-2 gap-4 text-white/80 text-sm">
              {partnerLogos.map((logo) => (
                <div key={logo} className="rounded-2xl border border-white/20 px-4 py-3 text-center">
                  {logo}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-18">
          <motion.h2 {...fade(0)} className="text-[32px] md:text-[40px] font-bold text-center text-primary-700">
            Enterprise programs designed around outcomes
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {solutions.map((solution, idx) => (
              <motion.div
                key={solution.title}
                {...fade(0.1 * idx)}
                className="rounded-3xl border border-secondary-200 bg-secondary-50 p-8 shadow-soft"
              >
                <h3 className="text-xl font-semibold text-primary-700">{solution.title}</h3>
                <p className="mt-4 text-base leading-7 text-text-secondary">{solution.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade(0.3)} className="mt-14 rounded-3xl border border-secondary-200 bg-white p-8 shadow-soft">
            <h3 className="text-lg font-semibold text-primary-700">Metrics that matter</h3>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl bg-secondary-100 p-6 text-center">
                  <p className="text-[28px] font-extrabold text-primary-600">{metric.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-text-secondary">{metric.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.h2 {...fade(0)} className="text-[30px] md:text-[38px] font-bold text-center text-primary-700">
            How we partner with your organization
          </motion.h2>
          <div className="mt-12 grid gap-8">
            {programSteps.map((step, idx) => (
              <motion.div
                key={step.title}
                {...fade(idx * 0.15)}
                className="flex flex-col md:flex-row md:items-start gap-6 rounded-3xl border border-secondary-200 bg-white px-8 py-6 shadow-soft"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 font-semibold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-700">{step.title}</h3>
                  <p className="mt-2 text-base leading-7 text-text-secondary">{step.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-18">
          <motion.h2 {...fade(0)} className="text-[30px] md:text-[38px] font-bold text-center text-primary-700">
            Enterprise resource center
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.map((resource, idx) => (
              <motion.article
                key={resource.title}
                {...fade(idx * 0.12)}
                className="rounded-3xl border border-secondary-200 bg-secondary-50 p-6 shadow-soft"
              >
                <h3 className="text-lg font-semibold text-primary-700">{resource.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{resource.description}</p>
                <div className="mt-5">
                  <Button variant="ghost" className="px-0 text-primary-600 hover:text-primary-500">
                    Download
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20 text-center">
          <motion.h2 {...fade(0)} className="text-[32px] md:text-[42px] font-bold text-white">
            Let's design your concierge technology program
          </motion.h2>
          <motion.p
            {...fade(0.1)}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Share your goals and we’ll craft a roadmap, staffing model, and launch plan that protects your members while
            growing digital engagement.
          </motion.p>
          <motion.div {...fade(0.2)} className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="mailto:support@hitsapp.com?subject=Enterprise%20Concierge">
              <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                Talk with our team
              </Button>
            </a>
            <Link href="/plans">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                Review partnership tiers
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

