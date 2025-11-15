"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import MarketingHeader from "@/components/MarketingHeader";

const fade = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const contactTopics = [
  "Billing",
  "Appointment",
  "Technical Issue",
  "Safety Concern",
  "General Question",
];

const userTypes = [
  "Senior / Disabled Adult",
  "Caregiver",
  "Partner",
  "Specialist",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "",
    topic: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          userType: formData.userType,
          topic: formData.topic,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        userType: "",
        topic: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      alert(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />

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
            Contact & Support
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fade}
            className="mt-6 text-lg leading-8 text-text-secondary max-w-3xl mx-auto"
          >
            Have questions before you book? Need help with an existing appointment? We're here to help.
          </motion.p>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.15}
            variants={fade}
            className="mt-4 text-base leading-7 text-text-secondary max-w-3xl mx-auto"
          >
            We usually respond within 1 business day.
          </motion.p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 py-18">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fade}
              custom={0}
              className="rounded-2xl border border-secondary-200 bg-white p-8 text-center shadow-soft"
            >
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Support Email</h3>
              <a href="mailto:support@hitsapp.com" className="text-primary-600 hover:text-primary-500">
                support@hitsapp.com
              </a>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fade}
              custom={0.1}
              className="rounded-2xl border border-secondary-200 bg-white p-8 text-center shadow-soft"
            >
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Support Phone</h3>
              <a href="tel:+16467586606" className="text-primary-600 hover:text-primary-500">
                (646) 758-6606
              </a>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fade}
              custom={0.2}
              className="rounded-2xl border border-secondary-200 bg-white p-8 text-center shadow-soft"
            >
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Hours of Operation</h3>
              <p className="text-text-secondary">Monday-Friday: 9am-5pm EST</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-8 md:px-12 py-18">
          {submitted ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fade}
              className="rounded-3xl border border-primary-200 bg-primary-50 p-8 text-center"
            >
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Thank You!</h2>
              <p className="text-lg text-text-secondary">
                We've received your message and will get back to you as soon as possible.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fade}
              custom={0}
              className="rounded-3xl border border-secondary-200 bg-secondary-50 p-8 md:p-12 shadow-soft"
            >
              <h2 className="text-2xl font-bold text-primary-700 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-primary-700 mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-primary-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-primary-700 mb-2">
                      Phone (optional)
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="userType" className="block text-sm font-semibold text-primary-700 mb-2">
                      Are you a: *
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      required
                      value={formData.userType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select...</option>
                      {userTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="topic" className="block text-sm font-semibold text-primary-700 mb-2">
                      Topic: *
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      required
                      value={formData.topic}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select...</option>
                      {contactTopics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-primary-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-primary-500 hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </section>

      {/* Links Section */}
      <section className="bg-secondary-100">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
            className="text-[28px] md:text-[36px] font-bold text-primary-700 text-center mb-8"
          >
            Additional Resources
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/faq">
              <Button variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                FAQ
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

