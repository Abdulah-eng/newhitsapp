"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMembership } from "@/lib/hooks/useMembership";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import MembershipPaymentForm from "@/components/features/MembershipPaymentForm";
import { X, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const fadeVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const offerings = [
  {
    title: "Live Concierge Sessions",
    description:
      "Video or phone sessions with vetted HITS specialists who walk through tasks at your pace—no jargon, no judgment.",
    points: ["Device setup & personalization", "Video chat, email, social media coaching", "Fraud & scam protection"],
  },
  {
    title: "On-Demand Library",
    description:
      "Step-by-step guides, videos, and checklists available 24/7. Organized by task so members can revisit lessons any time.",
    points: ["Plain-language instructions", "Large-type PDF downloads", "New content every week"],
  },
  {
    title: "Community Workshops",
    description:
      "Small-group classes covering trending topics like telehealth visits, smart home devices, photo archiving, and more.",
    points: ["Hosted virtually & on-site", "Q&A with senior-friendly IT pros", "Recordings to watch later"],
  },
];

const supportMoments = [
  "Staying safe from phishing and fake pop-ups",
  "Streaming family events and joining video calls",
  "Organizing photos, passwords, and important files",
  "Setting up wearables, tablets, and TVs",
  "Mastering grocery, pharmacy, and telehealth apps",
];

const membershipTiers = [
  {
    name: "Starter",
    price: "$39",
    cadence: "per month",
    highlight: "Ideal for staying connected and solving occasional tech hiccups.",
    features: ["1 live concierge session / month", "Unlimited access to guide library", "Security alerts & scam watch"],
  },
  {
    name: "Essentials",
    price: "$69",
    cadence: "per month",
    highlight: "Best for active users who want consistent coaching and rapid help.",
    features: ["3 live concierge sessions / month", "Priority same-day scheduling", "Quarterly digital wellness review"],
    accent: true,
  },
  {
    name: "Family+",
    price: "$119",
    cadence: "per month",
    highlight: "Share support with loved ones while keeping everyone informed and safe.",
    features: ["Unlimited live sessions for household", "Family progress dashboard", "Caregiver coordination hub"],
  },
];

export default function ConsumerServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  // Fetch online-only membership plans
  const { plans, isLoading: plansLoading, fetchMembership } = useMembership(user?.id, "online-only");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{
    planId: string;
    subscriptionId: string;
    clientSecret: string;
    planName: string;
  } | null>(null);

  const handleChoosePlan = useCallback(
    async (planName: string) => {
      // If user is not logged in or not a senior, redirect to login
      if (!user || user.role !== "senior") {
        const encodedPlan = encodeURIComponent(planName);
        const membershipUrl = `/senior/membership-online?plan=${encodedPlan}`;
        const redirectUrl = `/login?redirect=${encodeURIComponent(membershipUrl)}`;
        router.push(redirectUrl);
        return;
      }

      // If plans are still loading, wait a bit
      if (plansLoading || plans.length === 0) {
        setError("Please wait while we load the plans...");
        return;
      }

      // Find the matching plan
      const planMap: { [key: string]: string } = {
        "starter": "starter",
        "essential": "essential",
        "essentials": "essential", // legacy mapping
        "family+": "family",
        "family": "family",
        "family+ online": "family", // legacy mapping
      };

      const normalizedPlan = planName.toLowerCase().trim();
      const planType = planMap[normalizedPlan];
      
      if (!planType) {
        setError("Plan not found. Please try again.");
        return;
      }

      const matchingPlan = plans.find(p => p.plan_type === planType);
      if (!matchingPlan) {
        setError("Plan not available. Please try again.");
        return;
      }

      setIsProcessing(true);
      setError("");

      try {
        console.log("[Consumer Services] Creating subscription for plan:", matchingPlan.id);
        
        const response = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ membershipPlanId: matchingPlan.id }),
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          // Try to parse error response
          let errorMessage = "Failed to create subscription";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details?.message || errorMessage;
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || `Server error (${response.status})`;
          }
          console.error("[Consumer Services] Subscription creation failed:", errorMessage);
          throw new Error(errorMessage);
        }

        // Parse successful response
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("[Consumer Services] Failed to parse response:", parseError);
          throw new Error("Invalid response from server. Please try again.");
        }

        console.log("[Consumer Services] Subscription response:", { 
          ok: response.ok, 
          hasClientSecret: !!data.clientSecret,
          subscriptionId: data.subscriptionId,
          error: data.error 
        });

        if (data.clientSecret) {
          console.log("[Consumer Services] Subscription created successfully, showing payment form");
          setSelectedPlanForPayment({ 
            planId: matchingPlan.id, 
            subscriptionId: data.subscriptionId, 
            clientSecret: data.clientSecret,
            planName: matchingPlan.name
          });
        } else {
          console.error("[Consumer Services] No client secret returned from subscription creation");
          throw new Error("Payment is required to activate membership. Please try again.");
        }
      } catch (err: any) {
        console.error("[Consumer Services] Error in handleChoosePlan:", err);
        setError(err.message || "Failed to activate membership. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [router, user, plans, plansLoading],
  );

  return (
    <main className="bg-secondary-50 text-text-primary">
      <MarketingHeader />
      <section className="bg-white border-b border-secondary-200">
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-18 lg:py-24 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeVariants} custom={0}>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold">Virtual Services</p>
            <h1 className="mt-6 text-[38px] md:text-[52px] font-extrabold leading-tight text-primary-900">
              Your friendly tech specialist, whenever you need it.
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              HITS pairs older adults and caregivers with patient experts who make technology simple, secure, and a
              little more fun. From the first setup to everyday confidence, we stay by your side.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-6 bg-primary-500 hover:bg-primary-600">
                  Start membership
                </Button>
              </Link>
              <a href="tel:+16467586606">
                <Button size="lg" variant="ghost" className="h-12 px-6 text-primary-600 hover:text-primary-500">
                  Call (646) 758-6606
                </Button>
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            className="relative"
          >
            <div className="rounded-3xl bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400 p-[1px] shadow-large">
              <div className="rounded-[30px] bg-white px-8 py-10">
                <p className="text-lg leading-8 text-primary-800">
                  "My specialist never rushes me. She answers the same "silly" question ten times with the same smile.
                  Now I stream concerts with my sisters every Sunday."
                </p>
                <p className="mt-6 text-sm uppercase tracking-[0.3em] text-accent-400">Lynette, HITS Member</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-6 hidden md:block rounded-2xl bg-secondary-100 border border-secondary-200 px-5 py-4 shadow-soft">
              <p className="text-sm font-semibold text-primary-600">98% of members feel more confident online after 60 days.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-18">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariants}
            custom={0}
            className="text-[30px] md:text-[38px] font-bold text-center text-primary-700"
          >
            Personalized help that grows with you
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeVariants}
            custom={0.2}
            className="mt-4 max-w-3xl mx-auto text-center text-lg leading-8 text-text-secondary"
          >
            Every plan includes a dedicated concierge team plus learning resources crafted for older adults. We meet you
            at your comfort level and celebrate progress together.
          </motion.p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {offerings.map((card, idx) => (
              <motion.div
                key={card.title}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeVariants}
                className="rounded-3xl bg-white border border-secondary-200 p-8 shadow-soft flex flex-col"
              >
                <h3 className="text-2xl font-semibold text-primary-700">{card.title}</h3>
                <p className="mt-4 text-base leading-7 text-text-secondary">{card.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-primary-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Button
                    variant="secondary"
                    className="w-full h-12 bg-secondary-200 text-primary-700 hover:bg-secondary-300"
                  >
                    Learn more
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-18 grid gap-12">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariants}
            custom={0}
            className="text-[30px] md:text-[38px] font-bold text-center text-primary-700"
          >
            Moments we support every day
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportMoments.map((moment, idx) => (
              <motion.div
                key={moment}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeVariants}
                custom={idx * 0.1}
                className="flex items-start gap-4 rounded-2xl border border-secondary-200 bg-secondary-50 p-6 shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 font-semibold">
                  {idx + 1}
                </div>
                <p className="text-base leading-7 text-text-secondary">{moment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-100">
        <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-20">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariants}
            custom={0}
            className="text-[30px] md:text-[38px] font-bold text-center text-primary-700"
          >
            Membership built around the way you learn
          </motion.h2>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {membershipTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeVariants}
                className={`rounded-3xl border bg-white p-8 shadow-soft ${
                  tier.accent ? "border-primary-400 ring-4 ring-primary-100" : "border-secondary-200"
                }`}
              >
                <p className="text-sm uppercase tracking-[0.3em] text-primary-500 font-semibold">{tier.name}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <p className="text-[42px] font-extrabold text-primary-700">{tier.price}</p>
                  <p className="text-sm text-text-secondary">{tier.cadence}</p>
                </div>
                <p className="mt-3 text-base leading-7 text-text-secondary">{tier.highlight}</p>
                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-primary-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    className={`w-full h-12 ${tier.accent ? "bg-primary-500 hover:bg-primary-600" : "bg-secondary-200 text-primary-700 hover:bg-secondary-300"}`}
                    onClick={() => handleChoosePlan(tier.name)}
                    type="button"
                    disabled={isProcessing || plansLoading}
                  >
                    {isProcessing ? "Processing..." : "Choose plan"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-8 md:px-12 py-18 text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeVariants}
            custom={0}
            className="text-[32px] md:text-[40px] font-bold text-white"
          >
            Let's make the digital world feel welcoming again.
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeVariants}
            custom={0.12}
            className="mt-4 text-lg leading-8 text-white/90"
          >
            Schedule a discovery call or jump straight into your first concierge session. We're here for every step.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeVariants}
            custom={0.2}
            className="mt-6 flex flex-wrap justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-6 bg-white text-primary-700 hover:bg-secondary-100">
                Join HITS
              </Button>
            </Link>
            <Link href="/howto-offerings">
              <Button size="lg" variant="secondary" className="h-12 px-6 bg-primary-500 text-white hover:bg-primary-400">
                Browse resources
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-error-50 border border-error-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-error-700">{error}</p>
              <button
                onClick={() => setError("")}
                className="mt-2 text-xs text-error-600 hover:text-error-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {selectedPlanForPayment && selectedPlanForPayment.clientSecret && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text-primary">
                Complete Payment - {selectedPlanForPayment.planName}
              </h3>
              <button
                onClick={() => {
                  setSelectedPlanForPayment(null);
                  setError("");
                }}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X size={24} />
              </button>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: selectedPlanForPayment.clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <MembershipPaymentForm
                clientSecret={selectedPlanForPayment.clientSecret}
                subscriptionId={selectedPlanForPayment.subscriptionId}
                planName={selectedPlanForPayment.planName}
                onSuccess={async () => {
                  setSelectedPlanForPayment(null);
                  // Refresh membership data if available
                  if (fetchMembership) {
                    await fetchMembership();
                  }
                  // Redirect to membership page to show active membership
                  router.push("/senior/membership-online");
                }}
                onCancel={() => {
                  setSelectedPlanForPayment(null);
                  setError("");
                }}
              />
            </Elements>
          </motion.div>
        </div>
      )}
    </main>
  );
}
