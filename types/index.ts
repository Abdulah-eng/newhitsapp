/**
 * User roles in the system
 */
export type UserRole = "senior" | "specialist" | "admin";

/**
 * Appointment status
 */
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

/**
 * Payment status
 */
export type PaymentStatus = "pending" | "completed" | "refunded" | "failed";

/**
 * Location type for appointments
 */
export type LocationType = "remote" | "in-person";

/**
 * Verification status for specialists
 */
export type VerificationStatus = "pending" | "verified" | "rejected";

/**
 * Base user type
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Senior user profile
 */
export interface SeniorProfile {
  id: string;
  user_id: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  preferred_contact_method: string;
  accessibility_needs?: Record<string, unknown>;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Specialist profile
 */
export interface SpecialistProfile {
  id: string;
  user_id: string;
  bio?: string;
  specialties: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
  }>;
  hourly_rate: number;
  service_areas: string[];
  verification_status: VerificationStatus;
  rating_average: number;
  total_reviews: number;
  total_appointments: number;
  years_experience?: number;
  languages_spoken: string[];
  background_check_date?: string;
  insurance_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Appointment
 */
export interface Appointment {
  id: string;
  senior_id: string;
  specialist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  issue_description: string;
  location_type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  meeting_link?: string;
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Review
 */
export interface Review {
  id: string;
  appointment_id: string;
  senior_id: string;
  specialist_id: string;
  rating: number;
  comment?: string;
  response_text?: string;
  response_created_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Message
 */
export interface Message {
  id: string;
  appointment_id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachments: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  read_at?: string;
  created_at: string;
}

/**
 * Payment
 */
export interface Payment {
  id: string;
  appointment_id: string;
  senior_id: string;
  specialist_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  refund_amount: number;
  refund_reason?: string;
  refunded_at?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

