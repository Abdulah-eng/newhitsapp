"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import { Save, Plus, X, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchAvailability();
    }
  }, [user, authLoading]);

  const fetchAvailability = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("specialist_availability")
      .select("*")
      .eq("specialist_id", user.id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching availability:", error);
      return;
    }

    setAvailability(data || []);
    setIsLoading(false);
  };

  const addTimeSlot = (dayOfWeek: number) => {
    setAvailability([
      ...availability,
      {
        day_of_week: dayOfWeek,
        start_time: "09:00",
        end_time: "17:00",
        is_available: true,
      },
    ]);
  };

  const removeTimeSlot = (index: number) => {
    const slot = availability[index];
    setAvailability(availability.filter((_, i) => i !== index));

    // If it has an ID, delete from database
    if (slot.id) {
      supabase
        .from("specialist_availability")
        .delete()
        .eq("id", slot.id);
    }
  };

  const updateTimeSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Delete all existing slots for this specialist
      const { error: deleteError } = await supabase
        .from("specialist_availability")
        .delete()
        .eq("specialist_id", user.id);

      if (deleteError) {
        console.error("Error deleting availability:", deleteError);
        setMessage({ 
          type: "error", 
          text: `Failed to delete existing availability: ${deleteError.message}. Please check your permissions.` 
        });
        setIsSaving(false);
        setTimeout(() => setMessage(null), 5000);
        return;
      }

      // Insert new slots
      const slotsToInsert = availability
        .filter((slot) => slot.is_available)
        .map((slot) => ({
          specialist_id: user.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: true,
        }));

      if (slotsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("specialist_availability")
          .insert(slotsToInsert);

        if (insertError) {
          console.error("Error inserting availability:", insertError);
          setMessage({ 
            type: "error", 
            text: `Failed to save availability: ${insertError.message}. Please check your permissions.` 
          });
        } else {
          setMessage({ type: "success", text: "Availability saved successfully!" });
          fetchAvailability();
        }
      } else {
        setMessage({ type: "success", text: "Availability cleared successfully!" });
      }
    } catch (error: any) {
      console.error("Unexpected error saving availability:", error);
      setMessage({ 
        type: "error", 
        text: `An unexpected error occurred: ${error.message || "Please try again."}` 
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/specialist/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Manage Availability
          </h1>
          <p className="text-xl text-text-secondary">
            Set your available hours for appointments
          </p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-success-50 border border-success-200 text-success-700"
                : "bg-error-50 border border-error-200 text-error-700"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="space-y-6">
            {DAYS.map((day, dayIndex) => {
              const daySlots = availability.filter((slot) => slot.day_of_week === dayIndex);
              
              return (
                <div key={dayIndex} className="border-b border-secondary-200 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">{day}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(dayIndex)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Time Slot
                    </Button>
                  </div>

                  {daySlots.length === 0 ? (
                    <p className="text-text-tertiary text-sm">No availability set</p>
                  ) : (
                    <div className="space-y-3">
                      {daySlots.map((slot, slotIndex) => {
                        const globalIndex = availability.findIndex(
                          (s) => s.day_of_week === slot.day_of_week && s.start_time === slot.start_time
                        );
                        return (
                          <div
                            key={globalIndex}
                            className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Clock size={18} className="text-primary-500" />
                              <input
                                type="time"
                                value={slot.start_time}
                                onChange={(e) =>
                                  updateTimeSlot(globalIndex, "start_time", e.target.value)
                                }
                                className="input text-sm"
                              />
                              <span className="text-text-secondary">to</span>
                              <input
                                type="time"
                                value={slot.end_time}
                                onChange={(e) =>
                                  updateTimeSlot(globalIndex, "end_time", e.target.value)
                                }
                                className="input text-sm"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeSlot(globalIndex)}
                            >
                              <X size={18} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <Save size={20} className="mr-2" />
            Save Availability
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

