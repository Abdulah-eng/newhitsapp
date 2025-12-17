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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function MembershipOnlinePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  // Fetch online-only membership plans
  const { membership, plans, isLoading, hasActiveMembership, cancelMembership, fetchMembership } = useMembership(user?.id, "online-only");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
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
      // Payment was successful, force refresh membership data
      // Wait a moment to ensure webhook has processed
      setTimeout(async () => {
        await fetchMembership();
        // Clean up URL after refresh
        router.replace("/senior/membership-online");
      }, 2000);
    }
  }, [searchParams, fetchMembership, router]);

  // Handle auto-selection from URL parameter (from consumer services page)
  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (
      planParam &&
      plans.length > 0 &&
      !selectedPlanForPayment &&
      !isLoading &&
      !isProcessing &&
      !hasActiveMembership
    ) {
      // Find plan by name (Starter, Essentials, Family+)
      const planMap: { [key: string]: string } = {
        "starter": "starter",
        "essential": "essential",
        "essentials": "essential", // legacy mapping
        "family+": "family",
        "family": "family",
        "family+ online": "family", // legacy mapping
      };
      
      const normalizedPlan = planParam.toLowerCase().trim();
      const planType = planMap[normalizedPlan];
      
      if (planType) {
        const matchingPlan = plans.find(p => p.plan_type === planType);
        if (matchingPlan) {
          console.log("[Membership Online] Auto-selecting plan from URL:", matchingPlan.name);
          // Small delay to ensure UI is ready
          setTimeout(() => {
            handleSelectPlan(matchingPlan.id).catch(err => {
              console.error("[Membership Online] Error auto-selecting plan:", err);
              setError(err.message || "Failed to load payment form");
            });
          }, 500);
        }
      }
    }
  }, [plans, searchParams, isLoading, isProcessing, selectedPlanForPayment, hasActiveMembership]);

  const handleSelectPlan = async (planId: string) => {
    setIsProcessing(true);
    setError("");

    try {
      console.log("[Membership Online] Creating subscription for plan:", planId);
      
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipPlanId: planId }),
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
        console.error("[Membership Online] Subscription creation failed:", errorMessage);
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("[Membership Online] Failed to parse response:", parseError);
        throw new Error("Invalid response from server. Please try again.");
      }

      console.log("[Membership Online] Subscription response:", { 
        ok: response.ok, 
        hasClientSecret: !!data.clientSecret,
        subscriptionId: data.subscriptionId,
        error: data.error 
      });

      if (data.clientSecret) {
        console.log("[Membership Online] Subscription created successfully, showing payment form");
        setSelectedPlanForPayment({ 
          planId, 
          subscriptionId: data.subscriptionId, 
          clientSecret: data.clientSecret 
        });
      } else {
        console.error("[Membership Online] No client secret returned from subscription creation");
        throw new Error("Payment is required to activate membership. Please try again.");
      }
    } catch (err: any) {
      console.error("[Membership Online] Error in handleSelectPlan:", err);
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
            reason: cancelReason || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to cancel subscription");
        }
      } else {
        // Fallback to direct cancellation
        await cancelMembership(cancelReason || "User requested cancellation");
      }

      setShowCancelConfirm(false);
      setCancelReason("");
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

  // Show error if plans failed to load
  if (plans.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="card bg-white p-8">
          <AlertCircle className="text-error-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">
            No Plans Available
          </h2>
          <p className="text-text-secondary text-center mb-6">
            We're sorry, but no membership plans are currently available. Please check back later or contact support.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/senior/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold text-text-primary">Online-Only Membership</h1>
          <p className="text-text-secondary mt-2">
            Manage your online tech support membership and enjoy exclusive benefits
          </p>
          <p className="mt-2 text-sm text-text-tertiary">
            If you re-subscribe after cancelling, billing restarts immediately on the day you reactivate.
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

        {/* Available Plans */}
        {!hasActiveMembership && (
          <motion.div variants={slideUp} className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card bg-white p-6"
                >
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
                    variant="primary"
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.id)}
                    isLoading={isProcessing}
                  >
                    Choose Plan
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
                  Complete Payment
                </h3>
                <button
                  onClick={() => {
                    setSelectedPlanForPayment(null);
                    // Remove plan parameter from URL if present
                    const newSearchParams = new URLSearchParams(searchParams.toString());
                    newSearchParams.delete("plan");
                    router.replace(`/senior/membership-online?${newSearchParams.toString()}`);
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
                  planName={plans.find((p) => p.id === selectedPlanForPayment.planId)?.name || "Membership"}
                  onSuccess={async () => {
                    setSelectedPlanForPayment(null);
                    // Force refresh membership data immediately
                    if (fetchMembership) {
                      // Clear the throttle to allow immediate fetch
                      await fetchMembership();
                      // Wait a moment for data to load, then refresh
                      setTimeout(() => {
                        // Force a hard refresh to ensure UI updates
                        window.location.href = "/senior/membership-online?payment=success";
                      }, 1500);
                    } else {
                      // Fallback: just reload
                      window.location.href = "/senior/membership-online?payment=success";
                    }
                  }}
                  onCancel={() => {
                    setSelectedPlanForPayment(null);
                    // Remove plan parameter from URL if present
                    const newSearchParams = new URLSearchParams(searchParams.toString());
                    newSearchParams.delete("plan");
                    router.replace(`/senior/membership-online?${newSearchParams.toString()}`);
                  }}
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
              <p className="text-text-secondary mb-4">
                Your membership will be cancelled at the end of your current billing period. You'll continue to have access until then, and you can reactivate anytime. Reactivating starts a fresh billing period right away.
              </p>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Optional cancellation reason
              </label>
              <textarea
                className="input min-h-[100px] mb-6"
                placeholder="Let us know why you're cancelling (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }}
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

export default function MembershipOnlinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <MembershipOnlinePageContent />
    </Suspense>
  );
}
