"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { ArrowLeft, Search, Filter, Mail, Phone, User, Calendar, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_type: string;
  topic: string;
  message: string;
  status: string;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminContactMessagesPage() {
  const supabase = createSupabaseBrowserClient();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = [...messages];

    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.name?.toLowerCase().includes(query) ||
          msg.email?.toLowerCase().includes(query) ||
          msg.message?.toLowerCase().includes(query) ||
          msg.topic?.toLowerCase().includes(query) ||
          msg.user_type?.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, statusFilter, searchQuery]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contact messages:", error);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string, notes?: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({
          status: newStatus,
          admin_notes: notes || null,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;

      // Log activity
      try {
        await fetch("/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "contact_message_updated",
            description: `Contact message ${messageId} status updated to ${newStatus}`,
            metadata: {
              contact_message_id: messageId,
              old_status: messages.find(m => m.id === messageId)?.status,
              new_status: newStatus,
            },
          }),
        });
      } catch (logError) {
        console.error("Error logging activity:", logError);
      }

      await fetchMessages();
      setSelectedMessage(null);
      setAdminNotes("");
    } catch (error: any) {
      console.error("Error updating message status:", error);
      alert("Failed to update message status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "read":
        return "bg-accent-50 text-accent-700 border-accent-200";
      case "in_progress":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "resolved":
        return "bg-success-50 text-success-700 border-success-200";
      case "archived":
        return "bg-secondary-200 text-text-secondary border-secondary-300";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
    }
  };

  const statusCounts = {
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    read: messages.filter((m) => m.status === "read").length,
    in_progress: messages.filter((m) => m.status === "in_progress").length,
    resolved: messages.filter((m) => m.status === "resolved").length,
    archived: messages.filter((m) => m.status === "archived").length,
  };

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
            Contact Messages
          </h1>
          <p className="text-xl text-text-secondary">
            View and manage contact form submissions
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "All", value: statusCounts.all, status: "all" },
            { label: "New", value: statusCounts.new, status: "new" },
            { label: "Read", value: statusCounts.read, status: "read" },
            { label: "In Progress", value: statusCounts.in_progress, status: "in_progress" },
            { label: "Resolved", value: statusCounts.resolved, status: "resolved" },
            { label: "Archived", value: statusCounts.archived, status: "archived" },
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
                  placeholder="Search by name, email, topic, or message..."
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
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Messages List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <Mail size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No contact messages found</p>
            <p className="text-text-tertiary">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No contact messages have been submitted yet"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card bg-white p-6 hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedMessage(message);
                  setAdminNotes(message.admin_notes || "");
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-text-primary">{message.name}</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1).replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{message.email}</span>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{message.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{message.user_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{message.topic}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(message.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary line-clamp-2">{message.message}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-text-primary">Contact Message Details</h3>
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setAdminNotes("");
                  }}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                    <p className="text-text-primary font-semibold">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary-600 hover:text-primary-500">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                      <a href={`tel:${selectedMessage.phone}`} className="text-primary-600 hover:text-primary-500">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">User Type</label>
                    <p className="text-text-primary">{selectedMessage.user_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Topic</label>
                    <p className="text-text-primary">{selectedMessage.topic}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                        selectedMessage.status
                      )}`}
                    >
                      {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1).replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Submitted</label>
                    <p className="text-text-primary">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <p className="text-text-primary whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="input w-full"
                    placeholder="Add notes about this message..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {selectedMessage.status !== "read" && (
                    <Button
                      variant="outline"
                      onClick={() => updateMessageStatus(selectedMessage.id, "read", adminNotes)}
                      isLoading={isUpdating}
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  {selectedMessage.status !== "in_progress" && (
                    <Button
                      variant="outline"
                      onClick={() => updateMessageStatus(selectedMessage.id, "in_progress", adminNotes)}
                      isLoading={isUpdating}
                    >
                      <Clock size={18} className="mr-2" />
                      Mark In Progress
                    </Button>
                  )}
                  {selectedMessage.status !== "resolved" && (
                    <Button
                      variant="primary"
                      onClick={() => updateMessageStatus(selectedMessage.id, "resolved", adminNotes)}
                      isLoading={isUpdating}
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                  {selectedMessage.status !== "archived" && (
                    <Button
                      variant="outline"
                      onClick={() => updateMessageStatus(selectedMessage.id, "archived", adminNotes)}
                      isLoading={isUpdating}
                      className="text-text-tertiary"
                    >
                      Archive
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMessage(null);
                      setAdminNotes("");
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

