"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import IssueDescriptionHelper from "@/components/features/IssueDescriptionHelper";
import SmartRecommendations from "@/components/features/SmartRecommendations";

interface Specialist {
  id: string;
  user_id: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  service_areas: string[];
  rating_average: number;
  total_reviews: number;
  user: {
    full_name: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

function BookAppointmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [step, setStep] = useState(1);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [locationType, setLocationType] = useState<"remote" | "in-person">("remote");
  const [address, setAddress] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const preselectedSpecialistId = searchParams.get("specialist");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user?.role !== "senior") {
      router.push("/");
      return;
    }
    fetchSpecialists();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (preselectedSpecialistId) {
      const specialist = specialists.find((s) => s.id === preselectedSpecialistId);
      if (specialist) {
        setSelectedSpecialist(specialist);
        setStep(2);
      }
    }
  }, [preselectedSpecialistId, specialists]);

  useEffect(() => {
    if (selectedSpecialist && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedSpecialist, selectedDate]);

  const fetchSpecialists = async () => {
    const { data, error } = await supabase
      .from("specialist_profiles")
      .select("*, user:user_id(full_name)")
      .eq("verification_status", "verified")
      .order("rating_average", { ascending: false, nullsFirst: false });

    if (!error && data) {
      setSpecialists(data as Specialist[]);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedSpecialist || !selectedDate) return;

    setIsLoading(true);
    const selectedDay = new Date(selectedDate).getDay();

    // Fetch specialist's availability for this day
    const { data: availability } = await supabase
      .from("specialist_availability")
      .select("*")
      .eq("specialist_id", selectedSpecialist.user_id)
      .eq("day_of_week", selectedDay)
      .eq("is_available", true);

    // Fetch existing appointments for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments } = await supabase
      .from("appointments")
      .select("scheduled_at, duration_minutes")
      .eq("specialist_id", selectedSpecialist.user_id)
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString())
      .in("status", ["pending", "confirmed"]);

    // Generate available time slots
    const slots: TimeSlot[] = [];
    if (availability && availability.length > 0) {
      availability.forEach((avail) => {
        const [startHour, startMin] = avail.start_time.split(":").map(Number);
        const [endHour, endMin] = avail.end_time.split(":").map(Number);
        const start = new Date(selectedDate);
        start.setHours(startHour, startMin, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(endHour, endMin, 0, 0);

        let current = new Date(start);
        while (current < end) {
          const timeStr = current.toTimeString().slice(0, 5);
          const slotEnd = new Date(current);
          slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(duration));

          // Check if this slot conflicts with existing appointments
          const isAvailable = !appointments?.some((apt) => {
            const aptStart = new Date(apt.scheduled_at);
            const aptEnd = new Date(aptStart);
            aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration_minutes);
            return (
              (current >= aptStart && current < aptEnd) ||
              (slotEnd > aptStart && slotEnd <= aptEnd) ||
              (current <= aptStart && slotEnd >= aptEnd)
            );
          });

          slots.push({
            time: timeStr,
            available: isAvailable && slotEnd <= end,
          });

          current.setMinutes(current.getMinutes() + 30); // 30-minute intervals
        }
      });
    }

    setAvailableSlots(slots);
    setIsLoading(false);
  };

  const handleBook = async () => {
    if (!selectedSpecialist || !selectedDate || !selectedTime || !issueDescription) {
      setError("Please fill in all required fields");
      return;
    }

    if (locationType === "in-person" && !address.trim()) {
      setError("Please provide an address for in-person appointments");
      return;
    }

    setIsBooking(true);
    setError("");

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
    const scheduledAtISO = scheduledAt.toISOString();

    const { data, error: bookingError } = await supabase
      .from("appointments")
      .insert({
        senior_id: user!.id,
        specialist_id: selectedSpecialist.user_id,
        scheduled_at: scheduledAtISO,
        duration_minutes: parseInt(duration),
        status: "pending",
        issue_description: issueDescription,
        location_type: locationType,
        address: locationType === "in-person" ? address : null,
      })
      .select()
      .single();

    if (bookingError) {
      setError("Failed to book appointment. Please try again.");
      setIsBooking(false);
      return;
    }

    // Redirect to appointment confirmation
    router.push(`/senior/my-appointments/${data.id}?success=true`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/senior/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Book an Appointment
          </h1>
          <p className="text-xl text-text-secondary">
            Schedule a session with an IT specialist
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={slideUp} className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= stepNum
                      ? "bg-primary-500 text-white"
                      : "bg-secondary-200 text-text-tertiary"
                  }`}
                >
                  {step > stepNum ? "✓" : stepNum}
                </div>
                {stepNum < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > stepNum ? "bg-primary-500" : "bg-secondary-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-text-secondary">
            <span>Specialist</span>
            <span>Date & Time</span>
            <span>Details</span>
            <span>Confirm</span>
          </div>
        </motion.div>

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

        <motion.div variants={slideUp} className="card bg-white p-8">
          {/* Step 1: Select Specialist */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary">
                  Choose a Specialist
                </h2>
                <Link href="/senior/book-appointment/ai-match">
                  <Button variant="accent" size="sm">
                    <Sparkles size={16} className="mr-2" />
                    AI Match
                  </Button>
                </Link>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {specialists.map((specialist) => (
                  <motion.div
                    key={specialist.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedSpecialist(specialist);
                      setStep(2);
                    }}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSpecialist?.id === specialist.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                          {specialist.user.full_name}
                        </h3>
                        {specialist.bio && (
                          <p className="text-text-secondary mb-3 line-clamp-2">
                            {specialist.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {specialist.specialties.slice(0, 3).map((specialty) => (
                            <span
                              key={specialty}
                              className="px-3 py-1 bg-primary-50 text-primary-700 rounded text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            ${specialist.hourly_rate}/hr
                          </span>
                          {specialist.rating_average > 0 && (
                            <span className="flex items-center gap-1">
                              ⭐ {specialist.rating_average.toFixed(1)} ({specialist.total_reviews} reviews)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && selectedSpecialist && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Select Date & Time
                  </h2>
                  <p className="text-text-secondary">
                    Specialist: <strong>{selectedSpecialist.user.full_name}</strong>
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Change Specialist
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-text-primary mb-2">
                    <Calendar className="inline mr-2" size={18} />
                    Select Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-text-primary mb-2">
                    <Clock className="inline mr-2" size={18} />
                    Duration (minutes)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      setSelectedTime("");
                    }}
                    className="input"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-base font-medium text-text-primary mb-2">
                    Available Time Slots
                  </label>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">
                      No available time slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <motion.button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-3 rounded-lg font-medium transition-all ${
                            selectedTime === slot.time
                              ? "bg-primary-500 text-white"
                              : slot.available
                              ? "bg-secondary-200 hover:bg-primary-100 text-text-primary"
                              : "bg-secondary-100 text-text-tertiary cursor-not-allowed opacity-50"
                          }`}
                          whileHover={slot.available ? { scale: 1.05 } : {}}
                          whileTap={slot.available ? { scale: 0.95 } : {}}
                        >
                          {slot.time}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Appointment Details */}
          {step === 3 && selectedSpecialist && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Appointment Details
                </h2>
                <div className="bg-secondary-50 p-4 rounded-lg space-y-2 text-sm">
                  <p>
                    <strong>Specialist:</strong> {selectedSpecialist.user.full_name}
                  </p>
                  <p>
                    <strong>Date & Time:</strong>{" "}
                    {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {duration} minutes
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-2">
                  What do you need help with? *
                </label>
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe your technology issue or what you'd like help with..."
                  required
                  rows={5}
                />
                <div className="mt-3">
                  <IssueDescriptionHelper
                    value={issueDescription}
                    onChange={setIssueDescription}
                    onImproved={(improved) => setIssueDescription(improved)}
                  />
                </div>
                {issueDescription.trim().length > 20 && (
                  <div className="mt-4">
                    <SmartRecommendations issueDescription={issueDescription} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-text-primary mb-4">
                  Appointment Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setLocationType("remote");
                      setAddress("");
                    }}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${
                      locationType === "remote"
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-200 hover:border-primary-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold text-text-primary mb-2">Remote</div>
                    <div className="text-sm text-text-secondary">
                      Video call or screen sharing
                    </div>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setLocationType("in-person")}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${
                      locationType === "in-person"
                        ? "border-primary-500 bg-primary-50"
                        : "border-secondary-200 hover:border-primary-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold text-text-primary mb-2">In-Person</div>
                    <div className="text-sm text-text-secondary">
                      Specialist visits your location
                    </div>
                  </motion.button>
                </div>
              </div>

              {locationType === "in-person" && (
                <div>
                  <label className="block text-base font-medium text-text-primary mb-2">
                    <MapPin className="inline mr-2" size={18} />
                    Address *
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    required={locationType === "in-person"}
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(4)}
                  disabled={!issueDescription.trim()}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && selectedSpecialist && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Confirm Appointment
                </h2>
                <p className="text-text-secondary">
                  Please review your appointment details
                </p>
              </div>

              <div className="bg-secondary-50 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Specialist</h3>
                  <p className="text-text-secondary">{selectedSpecialist.user.full_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Date & Time</h3>
                  <p className="text-text-secondary">
                    {new Date(`${selectedDate}T${selectedTime}`).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Duration</h3>
                  <p className="text-text-secondary">{duration} minutes</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Location</h3>
                  <p className="text-text-secondary">
                    {locationType === "remote" ? "Remote (Video Call)" : address}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">Issue Description</h3>
                  <p className="text-text-secondary whitespace-pre-line">{issueDescription}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-primary">Estimated Cost:</span>
                    <span className="text-2xl font-bold text-primary-500">
                      ${((parseInt(duration) / 60) * selectedSpecialist.hourly_rate).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBook}
                  isLoading={isBooking}
                >
                  Confirm & Book Appointment
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <BookAppointmentPageContent />
    </Suspense>
  );
}

