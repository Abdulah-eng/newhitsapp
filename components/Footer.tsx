"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  return (
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
              <li><Link href="/terms" className="hover:text-primary-500">Terms of Service</Link></li>
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
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-[14px] text-text-secondary">
              © 2025 HITS – Hire I.T. Specialist, Inc.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[14px]">
              <Link href="/privacy" className="text-text-secondary hover:text-primary-500">
                Privacy Policy
              </Link>
              <span className="text-text-secondary">|</span>
              <Link href="/terms" className="text-text-secondary hover:text-primary-500">
                Terms of Service
              </Link>
              <span className="text-text-secondary">|</span>
              <Link href="/safety" className="text-text-secondary hover:text-primary-500">
                Safety & Security
              </Link>
            </div>
            <p className="text-[12px] text-text-secondary mt-2">
              HITS is not a 911 or emergency service and does not provide financial, legal, or medical advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

