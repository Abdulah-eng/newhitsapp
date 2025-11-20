import { createSupabaseServerComponentClient } from "@/lib/supabase/server";

export type ActivityLogType =
  | "user_registered"
  | "user_logged_in"
  | "user_logged_out"
  | "user_updated_profile"
  | "appointment_created"
  | "appointment_updated"
  | "appointment_cancelled"
  | "appointment_completed"
  | "payment_created"
  | "payment_completed"
  | "payment_failed"
  | "payment_refunded"
  | "membership_created"
  | "membership_cancelled"
  | "membership_updated"
  | "membership_reinstated"
  | "dispute_created"
  | "dispute_resolved"
  | "dispute_dismissed"
  | "review_created"
  | "review_updated"
  | "settings_updated"
  | "specialist_verified"
  | "specialist_suspended"
  | "user_suspended"
  | "user_activated"
  | "contact_message_created"
  | "contact_message_updated";

interface ActivityLogMetadata {
  [key: string]: any;
}

/**
 * Log an activity to the activity_logs table
 */
export async function logActivity(
  type: ActivityLogType,
  userId: string | null,
  description: string,
  metadata: ActivityLogMetadata = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const supabase = await createSupabaseServerComponentClient();

    await supabase.from("activity_logs").insert({
      type,
      user_id: userId,
      description,
      metadata,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch (error) {
    // Don't throw errors for logging - just log to console
    console.error("Error logging activity:", error);
  }
}

/**
 * Log user registration
 */
export async function logUserRegistration(
  userId: string,
  email: string,
  role: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logActivity(
    "user_registered",
    userId,
    `User registered: ${email} (${role})`,
    { email, role },
    ipAddress,
    userAgent
  );
}

/**
 * Log user login
 */
export async function logUserLogin(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logActivity(
    "user_logged_in",
    userId,
    `User logged in: ${email}`,
    { email },
    ipAddress,
    userAgent
  );
}

/**
 * Log appointment creation
 */
export async function logAppointmentCreated(
  appointmentId: string,
  seniorId: string,
  specialistId: string,
  scheduledAt: string,
  totalPrice: number
): Promise<void> {
  await logActivity(
    "appointment_created",
    seniorId,
    `Appointment created: ${appointmentId}`,
    {
      appointment_id: appointmentId,
      specialist_id: specialistId,
      scheduled_at: scheduledAt,
      total_price: totalPrice,
    }
  );
}

/**
 * Log appointment status change
 */
export async function logAppointmentStatusChange(
  appointmentId: string,
  userId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await logActivity(
    "appointment_updated",
    userId,
    `Appointment status changed: ${oldStatus} → ${newStatus}`,
    {
      appointment_id: appointmentId,
      old_status: oldStatus,
      new_status: newStatus,
    }
  );
}

/**
 * Log payment completion
 */
export async function logPaymentCompleted(
  paymentId: string,
  userId: string,
  appointmentId: string,
  amount: number
): Promise<void> {
  await logActivity(
    "payment_completed",
    userId,
    `Payment completed: $${amount.toFixed(2)}`,
    {
      payment_id: paymentId,
      appointment_id: appointmentId,
      amount,
    }
  );
}

/**
 * Log membership creation
 */
export async function logMembershipCreated(
  membershipId: string,
  userId: string,
  planType: string,
  monthlyPrice: number
): Promise<void> {
  await logActivity(
    "membership_created",
    userId,
    `Membership created: ${planType} plan`,
    {
      membership_id: membershipId,
      plan_type: planType,
      monthly_price: monthlyPrice,
    }
  );
}

/**
 * Log membership cancellation
 */
export async function logMembershipCancelled(
  membershipId: string,
  userId: string,
  reason?: string
): Promise<void> {
  await logActivity(
    "membership_cancelled",
    userId,
    `Membership cancelled: ${membershipId}`,
    {
      membership_id: membershipId,
      cancellation_reason: reason,
    }
  );
}

/**
 * Log membership reinstatement
 */
export async function logMembershipReinstated(
  membershipId: string,
  userId: string,
  planType?: string
): Promise<void> {
  await logActivity(
    "membership_reinstated",
    userId,
    `Membership reinstated: ${membershipId}`,
    {
      membership_id: membershipId,
      plan_type: planType,
    }
  );
}

/**
 * Log dispute creation
 */
export async function logDisputeCreated(
  disputeId: string,
  userId: string,
  type: string,
  reason: string
): Promise<void> {
  await logActivity(
    "dispute_created",
    userId,
    `Dispute created: ${type}`,
    {
      dispute_id: disputeId,
      dispute_type: type,
      reason,
    }
  );
}

/**
 * Log dispute resolution
 */
export async function logDisputeResolved(
  disputeId: string,
  adminId: string,
  resolution: string
): Promise<void> {
  await logActivity(
    "dispute_resolved",
    adminId,
    `Dispute resolved: ${disputeId}`,
    {
      dispute_id: disputeId,
      resolution,
    }
  );
}

/**
 * Log settings update
 */
export async function logSettingsUpdate(
  adminId: string,
  settingKey: string,
  oldValue: any,
  newValue: any
): Promise<void> {
  await logActivity(
    "settings_updated",
    adminId,
    `Settings updated: ${settingKey}`,
    {
      setting_key: settingKey,
      old_value: oldValue,
      new_value: newValue,
    }
  );
}

