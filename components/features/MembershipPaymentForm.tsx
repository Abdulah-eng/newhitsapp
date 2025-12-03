"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import Button from "@/components/ui/Button";
import { AlertCircle, CheckCircle } from "lucide-react";

interface MembershipPaymentFormProps {
  clientSecret: string;
  subscriptionId: string;
  planName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MembershipPaymentForm({
  clientSecret,
  subscriptionId,
  planName,
  onSuccess,
  onCancel,
}: MembershipPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // First, submit the elements to validate and prepare the payment
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message || "Please check your payment details.");
        setIsProcessing(false);
        return;
      }

      // Then confirm the payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/senior/membership-online?payment=success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed. Please try again.");
        setIsProcessing(false);
      } else {
        setSuccess(true);
        // Payment succeeded - try to sync membership immediately
        // Then poll to confirm it's active
        let retries = 0;
        const maxRetries = 8;
        const pollInterval = 1500; // 1.5 seconds
        
        // First, try manual sync immediately (webhook might be delayed)
        const trySync = async () => {
          try {
            console.log("Attempting immediate membership sync...");
            const syncResponse = await fetch("/api/membership/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscriptionId }),
            });
            const syncData = await syncResponse.json();
            
            if (syncResponse.ok && syncData.success) {
              console.log("Membership synced successfully");
              return true;
            } else {
              console.warn("Sync returned:", syncData.error || syncData.message);
              // If membership already exists, that's also success
              if (syncData.message && syncData.message.includes("already exists")) {
                return true;
              }
            }
          } catch (syncErr: any) {
            console.error("Error syncing membership:", syncErr);
          }
          return false;
        };
        
        const checkMembership = async () => {
          try {
            const response = await fetch(`/api/membership/check?subscriptionId=${subscriptionId}`);
            const data = await response.json();
            
            if (data.membershipActive) {
              // Membership is active, proceed with success
              console.log("Membership is active, proceeding with success");
              setTimeout(() => {
                onSuccess();
              }, 500);
              return;
            }
            
            // If not active yet and we haven't tried sync, try it now
            if (retries === 0) {
              const synced = await trySync();
              if (synced) {
                // Wait a moment for the sync to complete, then check again
                setTimeout(() => {
                  checkMembership();
                }, 1000);
                retries++;
                return;
              }
            }
            
            // Continue polling
            if (retries < maxRetries) {
              retries++;
              setTimeout(checkMembership, pollInterval);
            } else {
              // Max retries reached, try one more sync then proceed
              console.warn("Max retries reached, attempting final sync");
              await trySync();
              setTimeout(() => {
                onSuccess();
              }, 1000);
            }
          } catch (err) {
            console.error("Error checking membership:", err);
            // On error, try sync one more time then proceed
            if (retries === 0) {
              await trySync();
            }
            setTimeout(() => {
              onSuccess();
            }, 2000);
          }
        };
        
        // Start checking after a short delay to allow payment to settle
        setTimeout(checkMembership, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-success-50 border border-success-200 rounded-lg text-center">
        <CheckCircle className="text-success-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-success-700 mb-2">
          Payment Successful!
        </h3>
        <p className="text-success-600">
          Your {planName} membership is now active.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Complete Your Membership Payment
        </h3>
        <p className="text-text-secondary mb-6">
          Enter your payment details to activate your {planName} membership.
        </p>
        <PaymentElement />
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isProcessing}
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? "Processing..." : "Subscribe & Pay"}
        </Button>
      </div>
    </form>
  );
}

