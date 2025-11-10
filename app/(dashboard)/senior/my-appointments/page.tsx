"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, Clock, MapPin, User, Search, Filter } from "lucide-react";

interface Appointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  issue_description: string;
  location_type: string;
  address?: string;
  specialist: {
    full_name: string;
  };
}

export default function MyAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchAppointments();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchQuery]);

  const fetchAppointments = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*, specialist:specialist_id(full_name)")
      .eq("senior_id", user.id)
      .order("scheduled_at", { ascending: false });

    if (error) {
      console.error("Error fetching appointments:", error);
      return;
    }

    setAppointments((data as Appointment[]) || []);
    setIsLoading(false);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.specialist.full_name.toLowerCase().includes(query) ||
          apt.issue_description.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success-50 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "in-progress":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "completed":
        return "bg-secondary-200 text-text-primary border-secondary-300";
      case "cancelled":
        return "bg-error-50 text-error-700 border-error-200";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            My Appointments
          </h1>
          <p className="text-xl text-text-secondary">
            View and manage your scheduled appointments
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search appointments..."
                className="input pl-12"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </motion.div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <Calendar className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-xl text-text-secondary mb-4">
              {appointments.length === 0
                ? "No appointments yet"
                : "No appointments match your filters"}
            </p>
            {appointments.length === 0 && (
              <Link href="/senior/book-appointment">
                <Button variant="primary">Book Your First Appointment</Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          {appointment.specialist.full_name}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1).replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>{appointment.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.location_type === "remote" ? (
                          <>
                            <MapPin size={18} />
                            <span>Remote (Video Call)</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={18} />
                            <span>{appointment.address}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {appointment.issue_description && (
                      <p className="mt-3 text-text-secondary line-clamp-2">
                        {appointment.issue_description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/senior/my-appointments/${appointment.id}`}>
                      <Button variant="outline" className="w-full md:w-auto">
                        View Details
                      </Button>
                    </Link>
                    {appointment.status === "pending" && (
                      <Button
                        variant="ghost"
                        className="w-full md:w-auto text-error-500 hover:text-error-600"
                        onClick={async () => {
                          if (confirm("Are you sure you want to cancel this appointment?")) {
                            await supabase
                              .from("appointments")
                              .update({
                                status: "cancelled",
                                cancelled_at: new Date().toISOString(),
                              })
                              .eq("id", appointment.id);
                            fetchAppointments();
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

