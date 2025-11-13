"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMembership } from "@/lib/hooks/useMembership";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import { CheckCircle, X, CreditCard, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import MembershipPaymentForm from "@/components/features/MembershipPaymentForm";
import FamilyCareManagement from "@/components/features/FamilyCareManagement";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function MembershipPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { membership, plans, isLoading, hasActiveMembership, createMembership, cancelMembership, fetchMembership } = useMembership(user?.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{
    planId: string;
    subscriptionId: string;
    clientSecret: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (!authLoading && user && user.role !== "senior") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Check for payment success and refresh membership
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment");
    if (paymentSuccess === "success" && fetchMembership) {
      // Payment was successful, refresh membership data
      fetchMembership();
      // Clean up URL
      router.replace("/senior/membership");
    }
  }, [searchParams, fetchMembership, router]);

  const handleSelectPlan = async (planId: string) => {
    setIsProcessing(true);
    setError("");

    try {
      // Create Stripe subscription
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipPlanId: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      if (data.clientSecret) {
        // Store subscription ID and redirect to payment
        setSelectedPlanForPayment({ planId, subscriptionId: data.subscriptionId, clientSecret: data.clientSecret });
      } else {
        // No client secret means payment is required but wasn't provided
        throw new Error("Payment is required to activate membership. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to activate membership. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    setError("");

    try {
      if (membership?.stripe_subscription_id) {
        // Cancel Stripe subscription
        const response = await fetch("/api/stripe/cancel-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: membership.stripe_subscription_id,
            cancelImmediately: false, // Cancel at period end
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to cancel subscription");
        }
      } else {
        // Fallback to direct cancellation
        await cancelMembership("User requested cancellation");
      }

      setShowCancelConfirm(false);
      alert("Membership will be cancelled at the end of your billing period. You can reactivate anytime.");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to cancel membership. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const currentPlan = membership?.membership_plan;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="mb-6">
          <Link
            href="/senior/dashboard"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Membership</h1>
          <p className="text-text-secondary mt-2">
            Manage your HITS membership and enjoy exclusive benefits
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-error-700">{error}</p>
          </motion.div>
        )}

        {/* Current Membership */}
        {hasActiveMembership && currentPlan && (
          <motion.div
            variants={slideUp}
            className="card bg-white p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Current Membership
                </h2>
                <p className="text-text-secondary">You're currently on the {currentPlan.name}</p>
              </div>
              <span className="px-4 py-2 bg-success-50 text-success-700 border border-success-200 rounded-lg font-medium">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary mb-2">
                  <CreditCard size={18} />
                  <span className="text-sm font-medium">Monthly Cost</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  ${currentPlan.monthly_price.toFixed(2)}/month
                </p>
              </div>

              {membership?.next_billing_date && (
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-text-secondary mb-2">
                    <Calendar size={18} />
                    <span className="text-sm font-medium">Next Billing Date</span>
                  </div>
                  <p className="text-lg font-semibold text-text-primary">
                    {new Date(membership.next_billing_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Your Benefits</h3>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="text-success-500 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
                className="text-error-500 border-error-500 hover:bg-error-50"
              >
                Cancel Membership
              </Button>
            </div>
          </motion.div>
        )}

        {/* Family Care+ Management */}
        {hasActiveMembership && membership?.membership_plan?.plan_type === "family_care_plus" && (
          <motion.div variants={slideUp} className="mb-8">
            <FamilyCareManagement />
          </motion.div>
        )}

        {/* Available Plans */}
        {!hasActiveMembership && (
          <motion.div variants={slideUp} className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Choose a Membership Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`card bg-white p-6 ${plan.plan_type === "comfort" ? "border-2 border-primary-500" : ""}`}
                >
                  {plan.plan_type === "comfort" && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-text-primary">${plan.monthly_price.toFixed(2)}</span>
                    <span className="text-text-secondary">/month</span>
                  </div>
                  <p className="text-text-secondary text-sm mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 3).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="text-primary-500 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.plan_type === "comfort" ? "primary" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.id)}
                    isLoading={isProcessing}
                  >
                    Select Plan
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Payment Form Modal */}
        {selectedPlanForPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-text-primary">
                  Complete Payment
                </h3>
                <button
                  onClick={() => setSelectedPlanForPayment(null)}
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
                  planName={plans.find((p) => p.id === selectedPlanForPayment.planId)?.name || "Membership"}
                  onSuccess={async () => {
                    setSelectedPlanForPayment(null);
                    // Refresh membership data
                    if (fetchMembership) {
                      await fetchMembership();
                    }
                    // Small delay to ensure data is refreshed
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }}
                  onCancel={() => setSelectedPlanForPayment(null)}
                />
              </Elements>
            </motion.div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-text-primary mb-4">Cancel Membership?</h3>
              <p className="text-text-secondary mb-6">
                Your membership will be cancelled at the end of your current billing period. You'll continue to have access until then, and you can reactivate anytime.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Membership
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-error-500 hover:bg-error-600"
                  onClick={handleCancel}
                  isLoading={isProcessing}
                >
                  Cancel Membership
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <MembershipPageContent />
    </Suspense>
  );
}

