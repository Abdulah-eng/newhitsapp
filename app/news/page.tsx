"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import Button from "@/components/ui/Button";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function NewsPage() {
  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-20 lg:py-28">
          <motion.div {...fadeUp(0)} className="text-center max-w-4xl mx-auto">
            <h1 className="text-[40px] md:text-[52px] font-extrabold leading-tight text-primary-900">
              HITS in the News
            </h1>
            <p className="mt-6 text-xl md:text-2xl font-semibold text-primary-700 leading-relaxed">
              Press releases, media coverage, and updates about HITS – Hire I.T. Specialist
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Content Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-20">
          <motion.div {...fadeUp(0.1)} className="text-center">
            <p className="text-lg leading-8 text-text-secondary mb-8">
              We're working on building our press and media presence. Check back soon for news, press releases, and media coverage about HITS.
            </p>
            <p className="text-base leading-7 text-text-secondary mb-12">
              For media inquiries, please contact us at{" "}
              <a href="mailto:press@hitsapp.com" className="text-primary-600 hover:text-primary-700 font-semibold">
                press@hitsapp.com
              </a>
            </p>
          </motion.div>

          {/* Placeholder for future news items */}
          <motion.div {...fadeUp(0.2)} className="mt-12 space-y-6">
            <div className="p-8 rounded-2xl border-2 border-dashed border-secondary-300 bg-secondary-50 text-center">
              <p className="text-text-tertiary italic">
                News and press releases will appear here as they become available.
              </p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div {...fadeUp(0.3)} className="mt-16 text-center">
            <Link href="/contact">
              <Button size="lg" className="h-12 px-8 bg-primary-500 hover:bg-primary-600">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

