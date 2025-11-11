"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp } from "@/lib/animations/config";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  created_at: string;
  specialist_profile?: {
    id: string;
    verification_status: string;
    specialties: string[];
    hourly_rate: number;
    bio?: string;
  };
}

function AdminUsersPageContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(
    searchParams.get("specialist") || null
  );
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Admin Users: Fetching users with filter:", filter);

      let query = supabase
        .from("users")
        .select(`
          *,
          specialist_profile:specialist_profiles(*)
        `)
        .order("created_at", { ascending: false });

      if (filter === "specialists") {
        query = query.eq("role", "specialist");
      } else if (filter === "seniors") {
        query = query.eq("role", "senior");
      } else if (filter === "pending") {
        // For pending, we need to query specialists and filter by verification_status
        query = query.eq("role", "specialist");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      console.log("Users fetched:", data?.length || 0);
      console.log("Users data:", data);

      // Filter by verification status if pending filter is selected
      let filteredData = data || [];
      if (filter === "pending") {
        console.log("Filtering for pending specialists...");
        console.log("All specialists before filter:", filteredData);
        filteredData.forEach((user, idx) => {
          console.log(`User ${idx}:`, {
            id: user.id,
            email: user.email,
            role: user.role,
            hasProfile: !!user.specialist_profile,
            profile: user.specialist_profile,
            verificationStatus: user.specialist_profile?.verification_status,
          });
        });
        filteredData = filteredData.filter(
          (user) => user.specialist_profile?.verification_status === "pending"
        );
        console.log("Pending specialists after filter:", filteredData.length);
        console.log("Filtered data:", filteredData);
      }

      // Filter by search term
      if (searchTerm) {
        filteredData = filteredData.filter(
          (user) =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setUsers(filteredData as User[]);

      // If a specific specialist is selected, scroll to it
      if (selectedSpecialist) {
        setTimeout(() => {
          const element = document.getElementById(`user-${selectedSpecialist}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId: string, status: "verified" | "rejected") => {
    try {
      setProcessing(userId);
      const response = await fetch(`/api/admin/verify-specialist/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update verification status");
      }

      // Refresh users list
      await fetchUsers();
      alert(`Specialist ${status === "verified" ? "verified" : "rejected"} successfully`);
    } catch (error: any) {
      console.error("Error updating verification:", error);
      alert(error.message || "Failed to update verification status");
    } finally {
      setProcessing(null);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
            <CheckCircle size={12} />
            Verified
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-700">
            <Clock size={12} />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-50 text-error-700">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            User Management
          </h1>
          <p className="text-xl text-text-secondary">
            Manage users, verify specialists, and monitor accounts
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size="md"
                onClick={() => setFilter("all")}
              >
                All Users
              </Button>
              <Button
                variant={filter === "specialists" ? "primary" : "outline"}
                size="md"
                onClick={() => setFilter("specialists")}
              >
                Specialists
              </Button>
              <Button
                variant={filter === "pending" ? "primary" : "outline"}
                size="md"
                onClick={() => setFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filter === "seniors" ? "primary" : "outline"}
                size="md"
                onClick={() => setFilter("seniors")}
              >
                Seniors
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <motion.div variants={slideUp} className="card bg-white p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
              <p className="text-text-secondary">No users found</p>
            </motion.div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user.id}
                id={`user-${user.id}`}
                variants={slideUp}
                className={`card bg-white p-6 ${
                  selectedSpecialist === user.id ? "ring-2 ring-primary-500" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          {user.full_name || "Unknown User"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                          {user.role}
                        </span>
                        {user.specialist_profile && getVerificationBadge(user.specialist_profile.verification_status)}
                      </div>
                    </div>

                    {user.specialist_profile && (
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-text-secondary mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-2">
                            {user.specialist_profile.specialties?.map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded text-xs bg-secondary-100 text-text-primary"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        {user.specialist_profile.bio && (
                          <div>
                            <p className="text-sm font-medium text-text-secondary mb-1">Bio:</p>
                            <p className="text-sm text-text-primary">{user.specialist_profile.bio}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-text-secondary">
                            Hourly Rate: <span className="font-medium text-text-primary">${user.specialist_profile.hourly_rate}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-text-secondary">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {user.specialist_profile && user.specialist_profile.verification_status === "pending" && (
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleVerification(user.id, "verified")}
                        isLoading={processing === user.id}
                        disabled={!!processing}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleVerification(user.id, "rejected")}
                        isLoading={processing === user.id}
                        disabled={!!processing}
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <AdminUsersPageContent />
    </Suspense>
  );
}

