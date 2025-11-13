"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { fadeIn } from "@/lib/animations/config";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  appointmentId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  appointmentId,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // First, submit the elements to validate and prepare the payment
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setMessage({
          type: "error",
          text: submitError.message || "Please check your payment details.",
        });
        onError(submitError.message || "Validation failed");
        setIsProcessing(false);
        return;
      }

      // Then confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/senior/my-appointments/${appointmentId}?payment=success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Payment failed. Please try again.",
        });
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setMessage({
          type: "success",
          text: "Payment successful! Your appointment is confirmed.",
        });
        
        // Immediately try to sync payment (in case webhook is delayed)
        try {
          const syncResponse = await fetch(`/api/appointments/${appointmentId}/sync-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
            }),
          });
          
          const syncData = await syncResponse.json();
          if (syncData.success) {
            console.log("[PaymentForm] Payment synced successfully");
          } else {
            console.log("[PaymentForm] Payment sync returned:", syncData.message);
          }
        } catch (syncError) {
          console.error("[PaymentForm] Error syncing payment:", syncError);
          // Don't block success - webhook will handle it
        }
        
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setIsProcessing(false);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "An error occurred. Please try again.",
      });
      onError(err.message || "An error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success"
              ? "bg-success-50 border border-success-200"
              : "bg-error-50 border border-error-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="text-success-500 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
          )}
          <p
            className={`text-sm ${
              message.type === "success" ? "text-success-700" : "text-error-700"
            }`}
          >
            {message.text}
          </p>
        </motion.div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
        isLoading={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function PaymentForm({
  appointmentId,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId,
            amount,
          }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
          onError(data.error);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError("Failed to initialize payment. Please try again.");
        onError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [appointmentId, amount, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="p-6 bg-error-50 border border-error-200 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-error-700 mb-1">Payment Error</h3>
            <p className="text-sm text-error-600">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2C5F8D",
        colorBackground: "#ffffff",
        colorText: "#2C2C2C",
        colorDanger: "#D9534F",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        appointmentId={appointmentId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

