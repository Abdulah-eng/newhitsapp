import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

// Validate Stripe key format
const stripeKey = process.env.STRIPE_SECRET_KEY.trim();

// Check for placeholder/example keys
const placeholderPatterns = [
  "your-secret-key",
  "your_secret_key",
  "sk_test_your",
  "sk_live_your",
  "sk_test_here",
  "sk_live_here",
  "example",
  "placeholder",
];

const isPlaceholder = placeholderPatterns.some(pattern => 
  stripeKey.toLowerCase().includes(pattern.toLowerCase())
);

if (isPlaceholder) {
  console.error("[Stripe] ERROR: Stripe secret key appears to be a placeholder/example value!");
  console.error("[Stripe] Please set a valid Stripe secret key in your environment variables.");
  throw new Error("Stripe secret key is a placeholder. Please set a valid key.");
}

const isTestKey = stripeKey.startsWith("sk_test_");
const isLiveKey = stripeKey.startsWith("sk_live_");
const isRestrictedKey = stripeKey.startsWith("sk_") && (stripeKey.includes("_rk_") || stripeKey.includes("_rk_test_") || stripeKey.includes("_rk_live_"));

if (!isTestKey && !isLiveKey && !isRestrictedKey) {
  console.error("[Stripe] Invalid Stripe secret key format. Key should start with sk_test_, sk_live_, or be a restricted key.");
  console.error("[Stripe] Key prefix:", stripeKey.substring(0, Math.min(20, stripeKey.length)));
  throw new Error("Invalid Stripe secret key format");
}

// Warn if using test key in production (but don't block - allow for testing)
if (isTestKey && process.env.NODE_ENV === "production") {
  console.warn("[Stripe] WARNING: Using test key (sk_test_) in production environment!");
  console.warn("[Stripe] This should be a live key (sk_live_) for production deployments.");
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

/**
 * Create a Stripe payment intent for an appointment
 * All payments go to HITS main account only (no destination charges or automatic payouts)
 */
export async function createPaymentIntent(
  amount: number,
  appointmentId: string,
  customerId?: string,
  options?: {
    baseAmount?: number;
    travelFee?: number;
    shippingAddress?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }
) {
  try {
    // Calculate tax using Stripe Tax API
    // NC tax rate: 7% (4.75% state + 2.25% Cumberland County)
    let taxAmount = 0;
    let taxCalculation: Stripe.Tax.Calculation | null = null;

    if (options?.shippingAddress) {
      try {
        // Create tax calculation for NC service tax
        taxCalculation = await stripe.tax.calculations.create({
          currency: "usd",
          line_items: [
            {
              amount: Math.round((options.baseAmount || amount) * 100), // Base service amount
              reference: "service_fee",
            },
            ...(options.travelFee && options.travelFee > 0
              ? [
                  {
                    amount: Math.round(options.travelFee * 100), // Travel fee
                    reference: "travel_fee",
                  },
                ]
              : []),
          ],
          customer_details: {
            address: {
              line1: options.shippingAddress.line1 || "",
              city: options.shippingAddress.city || "",
              state: options.shippingAddress.state || "NC",
              postal_code: options.shippingAddress.postal_code || "",
              country: options.shippingAddress.country || "US",
            },
            address_source: "shipping",
          },
        });

        taxAmount = (taxCalculation.tax_amount_exclusive || 0) / 100;
      } catch (taxError) {
        console.warn("Stripe Tax calculation failed, using manual calculation:", taxError);
        // Fallback: Manual 7% tax calculation for NC
        taxAmount = ((options?.baseAmount || amount) + (options?.travelFee || 0)) * 0.07;
      }
    } else {
      // Fallback: Manual 7% tax calculation for NC if no address provided
      taxAmount = ((options?.baseAmount || amount) + (options?.travelFee || 0)) * 0.07;
    }

    const totalAmount = amount + taxAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents (includes tax)
      currency: "usd",
      metadata: {
        appointment_id: appointmentId,
        base_amount: ((options?.baseAmount || amount) * 100).toString(),
        travel_fee: ((options?.travelFee || 0) * 100).toString(),
        tax_amount: (taxAmount * 100).toString(),
      },
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      // IMPORTANT: No destination charges or automatic payouts
      // All money goes to HITS main account only
      // Specialists receive payouts manually or on schedule
    });

    // Return payment intent with additional tax information
    return Object.assign(paymentIntent, {
      calculatedTax: taxAmount,
      taxCalculationId: taxCalculation?.id,
    }) as Stripe.PaymentIntent & { calculatedTax: number; taxCalculationId?: string };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  userId: string
) {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        user_id: userId,
      },
    });

    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
}

/**
 * Create a refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  try {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundData.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    return await stripe.refunds.create(refundData);
  } catch (error) {
    console.error("Error creating refund:", error);
    throw error;
  }
}

