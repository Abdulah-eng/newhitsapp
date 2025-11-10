"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMessages } from "@/lib/hooks/useMessages";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, Send, User, Check, CheckCheck } from "lucide-react";
import Link from "next/link";

function SpecialistChatPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [otherUserId, setOtherUserId] = useState<string>("");

  const appointmentId = searchParams.get("appointment") || undefined;

  useEffect(() => {
    const getUserId = async () => {
      const resolvedParams = await params;
      setOtherUserId(resolvedParams.userId as string);
    };
    getUserId();
  }, [params]);

  const { messages, isLoading, sendMessage, markAsRead } = useMessages({
    appointmentId,
    otherUserId,
    enabled: !!otherUserId,
  });

  useEffect(() => {
    if (!authLoading && user?.id && otherUserId) {
      fetchOtherUser();
    }
  }, [user, authLoading, otherUserId, supabase]);

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read when viewing
    messages.forEach((msg) => {
      if (msg.receiver_id === user?.id && !msg.read_at) {
        markAsRead(msg.id);
      }
    });
  }, [messages, user]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const fetchOtherUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_url")
      .eq("id", otherUserId)
      .single();

    if (!error && data) {
      setOtherUser(data);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || !otherUserId) return;

    setIsSending(true);
    const messageContent = message.trim();
    setMessage("");

    const sent = await sendMessage(otherUserId, messageContent);

    if (sent) {
      scrollToBottom();
    }

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000) as unknown as NodeJS.Timeout;
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
        className="h-[calc(100vh-200px)] flex flex-col"
      >
        {/* Header */}
        <motion.div variants={slideUp} className="card bg-white p-4 mb-4">
          <div className="flex items-center gap-4">
            <Link href="/specialist/messages">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-text-primary">
                {otherUser?.full_name || "Loading..."}
              </h2>
              {isTyping && (
                <p className="text-sm text-text-tertiary">Typing...</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div
          variants={slideUp}
          className="card bg-white flex-1 flex flex-col p-4 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwn && (
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          isOwn
                            ? "bg-primary-500 text-white"
                            : "bg-secondary-100 text-text-primary"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isOwn && (
                            <span>
                              {msg.read_at ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      {isOwn && (
                        <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-text-primary" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!message.trim() || isSending}
            >
              <Send size={18} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SpecialistChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <SpecialistChatPageContent />
    </Suspense>
  );
}

