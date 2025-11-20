"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConversations } from "@/lib/hooks/useConversations";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import { MessageSquare, Search, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  // Authentication and role checking is handled by the layout
  // No need to duplicate redirect logic here

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Link
          href="/senior/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            Messages
          </h1>
          <p className="text-xl text-text-secondary">
            Communicate with your specialists
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <motion.div variants={slideUp} className="lg:col-span-1">
            <div className="card bg-white p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="card bg-white p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                  <p className="text-text-secondary">
                    {conversations.length === 0
                      ? "No messages yet"
                      : "No conversations match your search"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <Link
                    key={conversation.otherUser.id}
                    href={`/senior/messages/${conversation.otherUser.id}${conversation.appointmentId ? `?appointment=${conversation.appointmentId}` : ""}`}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        searchParams.get("userId") === conversation.otherUser.id
                          ? "bg-primary-50 border-2 border-primary-500"
                          : "bg-secondary-50 hover:bg-secondary-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-text-primary truncate">
                              {conversation.otherUser.full_name}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary truncate">
                            {conversation.lastMessage.content}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            {searchParams.get("userId") ? (
              <div className="card bg-white p-4">
                <p className="text-text-secondary text-center py-8">
                  Select a conversation to view messages
                </p>
              </div>
            ) : (
              <div className="card bg-white p-12 text-center">
                <MessageSquare className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <p className="text-xl text-text-secondary mb-2">
                  Select a conversation
                </p>
                <p className="text-text-tertiary">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}

