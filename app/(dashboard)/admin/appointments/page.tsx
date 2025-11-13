"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { Calendar, ArrowLeft, Search, Filter, Clock, User, MapPin, CheckCircle, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface UserData {
  id: string;
  full_name: string;
  email: string;
}

interface Appointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  issue_description: string;
  location_type: string;
  address?: string;
  full_address?: string;
  travel_distance_miles?: number;
  travel_fee?: number;
  created_at: string;
  senior: {
    full_name: string;
    email: string;
  };
  specialist: {
    full_name: string;
    email: string;
  };
}

export default function AdminAppointmentsPage() {
  const supabase = createSupabaseBrowserClient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Initialize filteredAppointments when appointments are loaded
    if (appointments.length === 0) {
      setFilteredAppointments([]);
      return;
    }

    let filtered = [...appointments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.senior?.full_name?.toLowerCase().includes(query) ||
          apt.specialist?.full_name?.toLowerCase().includes(query) ||
          apt.issue_description?.toLowerCase().includes(query) ||
          apt.senior?.email?.toLowerCase().includes(query) ||
          apt.specialist?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, searchQuery]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Fetch all appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*, travel_distance_miles, travel_fee, full_address")
        .order("created_at", { ascending: false });

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        setIsLoading(false);
        return;
      }

      if (!appointmentsData || appointmentsData.length === 0) {
        setAppointments([]);
        setFilteredAppointments([]);
        setIsLoading(false);
        return;
      }

      // Fetch user details for seniors and specialists
      const seniorIds = [...new Set(appointmentsData.map((apt) => apt.senior_id).filter(Boolean))];
      const specialistIds = [...new Set(appointmentsData.map((apt) => apt.specialist_id).filter(Boolean))];
      const allUserIds = [...new Set([...seniorIds, ...specialistIds])];

      let usersData: UserData[] = [];
      if (allUserIds.length > 0) {
        const { data, error: usersError } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", allUserIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
        } else {
          usersData = data || [];
        }
      }

      // Combine appointments with user data
      const appointmentsWithUsers = appointmentsData.map((apt) => {
        const senior = apt.senior_id ? usersData.find((u) => u.id === apt.senior_id) : null;
        const specialist = apt.specialist_id ? usersData.find((u) => u.id === apt.specialist_id) : null;
        return {
          ...apt,
          senior: {
            full_name: senior?.full_name || "Unknown",
            email: senior?.email || "N/A",
          },
          specialist: {
            full_name: specialist?.full_name || "Unknown",
            email: specialist?.email || "N/A",
          },
        };
      });

      setAppointments(appointmentsWithUsers as Appointment[]);

      // Immediately set filtered appointments to match all appointments
      // The useEffect will handle filtering based on statusFilter and searchQuery
      setFilteredAppointments(appointmentsWithUsers as Appointment[]);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setIsLoading(false);
    }
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

  const getStatusCounts = () => {
    return {
      all: appointments.length,
      pending: appointments.filter((apt) => apt.status === "pending").length,
      confirmed: appointments.filter((apt) => apt.status === "confirmed").length,
      "in-progress": appointments.filter((apt) => apt.status === "in-progress").length,
      completed: appointments.filter((apt) => apt.status === "completed").length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Appointments Management
          </h1>
          <p className="text-xl text-text-secondary">
            View and manage all platform appointments
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "All", value: statusCounts.all, status: "all" },
            { label: "Pending", value: statusCounts.pending, status: "pending" },
            { label: "Confirmed", value: statusCounts.confirmed, status: "confirmed" },
            { label: "In Progress", value: statusCounts["in-progress"], status: "in-progress" },
            { label: "Completed", value: statusCounts.completed, status: "completed" },
            { label: "Cancelled", value: statusCounts.cancelled, status: "cancelled" },
          ].map((stat) => (
            <motion.div
              key={stat.status}
              variants={slideUp}
              className={`card bg-white p-4 cursor-pointer transition-all ${
                statusFilter === stat.status ? "ring-2 ring-primary-500" : ""
              }`}
              onClick={() => setStatusFilter(stat.status)}
            >
              <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-primary-500">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                <Input
                  type="text"
                  placeholder="Search by name, email, or issue description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-text-secondary" />
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
          </div>
        </motion.div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No appointments found</p>
            <p className="text-text-tertiary">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No appointments have been created yet"}
            </p>
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
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                          Appointment #{appointment.id.substring(0, 8)}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <User size={18} className="text-text-secondary mt-1" />
                        <div>
                          <p className="text-sm text-text-secondary">Senior</p>
                          <p className="font-semibold text-text-primary">{appointment.senior.full_name}</p>
                          <p className="text-xs text-text-tertiary">{appointment.senior.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User size={18} className="text-text-secondary mt-1" />
                        <div>
                          <p className="text-sm text-text-secondary">Specialist</p>
                          <p className="font-semibold text-text-primary">{appointment.specialist.full_name}</p>
                          <p className="text-xs text-text-tertiary">{appointment.specialist.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-text-secondary mt-1" />
                        <div>
                          <p className="text-sm text-text-secondary">Scheduled</p>
                          <p className="font-semibold text-text-primary">
                            {new Date(appointment.scheduled_at).toLocaleString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock size={18} className="text-text-secondary mt-1" />
                        <div>
                          <p className="text-sm text-text-secondary">Duration</p>
                          <p className="font-semibold text-text-primary">{appointment.duration_minutes} minutes</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-text-secondary mt-1" />
                        <div>
                          <p className="text-sm text-text-secondary">Location</p>
                          <p className="font-semibold text-text-primary">
                            {appointment.location_type === "remote"
                              ? "Remote (Video Call)"
                              : appointment.full_address || appointment.address || "Address not provided"}
                          </p>
                          {appointment.location_type === "in-person" && appointment.travel_distance_miles && (
                            <p className="text-xs text-text-tertiary mt-1">
                              Distance: {appointment.travel_distance_miles.toFixed(1)} miles
                              {appointment.travel_fee && appointment.travel_fee > 0 && ` • Travel fee: $${appointment.travel_fee.toFixed(2)}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-text-secondary mb-1">Issue Description</p>
                      <p className="text-text-primary bg-secondary-50 p-3 rounded-lg">
                        {appointment.issue_description}
                      </p>
                    </div>
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
