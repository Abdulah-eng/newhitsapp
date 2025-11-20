"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ArrowLeft, Search, Filter, Crown, RefreshCcw } from "lucide-react";

type MembershipRow = {
  id: string;
  status: string;
  started_at: string;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  cancellation_requested_at?: string | null;
  cancellation_effective_date?: string | null;
  reactivated_at?: string | null;
  next_billing_date?: string | null;
  user?: {
    full_name: string;
    email: string;
  };
  membership_plan?: {
    name: string;
    plan_type: string;
    monthly_price: number;
  };
};

const STATUS_FILTERS = ["all", "active", "pending", "cancelled", "expired"];

export default function AdminMembershipsPage() {
  const supabase = createSupabaseBrowserClient();
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use API route to bypass RLS
      const response = await fetch("/api/admin/memberships");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch memberships" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setMemberships(result.memberships || []);
    } catch (err: any) {
      console.error("[Admin Memberships] Error:", err);
      setError(err.message || "Failed to load memberships");
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMemberships = useMemo(() => {
    let rows = [...memberships];

    if (statusFilter !== "all") {
      rows = rows.filter((row) => row.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.user?.full_name?.toLowerCase().includes(query) ||
          row.user?.email?.toLowerCase().includes(query)
      );
    }

    return rows;
  }, [memberships, statusFilter, searchQuery]);

  return (
    <div>
      <motion.div initial="initial" animate="animate" variants={fadeIn}>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-primary-500 mb-2">Memberships</h1>
            <p className="text-text-secondary">
              Track cancellations, reinstatements, and plan activity across the platform.
            </p>
          </div>
          <Button variant="outline" onClick={fetchMemberships} className="flex items-center gap-2">
            <RefreshCcw size={16} />
            Refresh
          </Button>
        </motion.div>

        <motion.div variants={slideUp} className="card bg-white p-6 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                <Input
                  type="text"
                  placeholder="Search by member name or email..."
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
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
              {error}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading memberships...</p>
          </div>
        ) : filteredMemberships.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <Crown size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No memberships found</p>
            <p className="text-text-tertiary">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search"
                : "No membership records available yet."}
            </p>
            {memberships.length > 0 && (
              <p className="text-sm text-warning-600 mt-2">
                Note: {memberships.length} membership(s) exist but were filtered out.
              </p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredMemberships.map((membership) => (
              <div 
                key={membership.id}
                className="card bg-white p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-text-primary">
                        {membership.user?.full_name || "Unknown User"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          membership.status === "active"
                            ? "bg-success-50 text-success-700"
                            : membership.status === "pending"
                            ? "bg-warning-50 text-warning-700"
                            : "bg-secondary-100 text-text-secondary"
                        }`}
                      >
                        {membership.status.toUpperCase()}
                      </span>
                      {membership.reactivated_at && (
                        <span className="px-2 py-1 text-xs font-semibold text-primary-700 bg-primary-50 rounded-full">
                          Reinstated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-4">{membership.user?.email}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs uppercase text-text-tertiary mb-1">Plan</p>
                        <p className="font-semibold text-text-primary">
                          {membership.membership_plan?.name || "Unknown Plan"}
                        </p>
                        <p className="text-text-secondary">
                          ${membership.membership_plan?.monthly_price?.toFixed(2) || "0.00"}/month
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-text-tertiary mb-1">Started</p>
                        <p className="font-semibold text-text-primary">
                          {new Date(membership.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      {membership.next_billing_date && (
                        <div>
                          <p className="text-xs uppercase text-text-tertiary mb-1">Next Billing</p>
                          <p className="font-semibold text-text-primary">
                            {new Date(membership.next_billing_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {membership.reactivated_at && (
                        <div>
                          <p className="text-xs uppercase text-text-tertiary mb-1">Reinstated</p>
                          <p className="font-semibold text-text-primary">
                            {new Date(membership.reactivated_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    {membership.cancellation_requested_at && (
                      <div className="mb-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                        <p className="text-xs uppercase text-warning-700 font-semibold mb-1">
                          Cancellation Requested
                        </p>
                        <p className="text-sm text-warning-800">
                          Requested: {new Date(membership.cancellation_requested_at).toLocaleString()}
                        </p>
                        {membership.cancellation_effective_date && (
                          <p className="text-sm text-warning-800">
                            Effective: {new Date(membership.cancellation_effective_date).toLocaleDateString()}
                          </p>
                        )}
                        {membership.cancellation_reason && (
                          <p className="text-xs text-warning-700 mt-1">
                            Reason: {membership.cancellation_reason}
                          </p>
                        )}
                      </div>
                    )}

                    {membership.cancelled_at && (
                      <div className="mb-3 p-3 bg-error-50 border border-error-200 rounded-lg">
                        <p className="text-xs uppercase text-error-700 font-semibold mb-1">Cancelled</p>
                        <p className="text-sm text-error-800">
                          Cancelled at {new Date(membership.cancelled_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}


