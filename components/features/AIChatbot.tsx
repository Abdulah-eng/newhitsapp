"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MessageSquare, X, Send, Bot, User, ExternalLink } from "lucide-react";
import { fadeIn, slideUp } from "@/lib/animations/config";
import { useAuth } from "@/lib/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm HITS Assistant, your virtual assistant for questions about HITS. I can help you learn about our services, pricing, and how visits work. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-primary-500 text-white rounded-full shadow-large flex items-center justify-center z-50 hover:bg-primary-600 transition-colors"
          aria-label="Open HITS Assistant"
        >
          <MessageSquare size={24} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-secondary-200"
          >
            {/* Header */}
            <div className="bg-primary-500 text-white p-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <div>
                  <h3 className="font-semibold">HITS Assistant</h3>
                  <p className="text-xs opacity-90">Virtual Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-600 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Links & Shortcuts */}
            {messages.length === 1 && (
              <div className="p-4 bg-secondary-50 border-b border-secondary-200">
                <p className="text-xs font-semibold text-primary-700 mb-2">Quick Links:</p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/plans" className="text-xs text-primary-600 hover:text-primary-500 underline">
                    Pricing & Plans
                  </Link>
                  <span className="text-text-secondary">•</span>
                  <Link href="/contact" className="text-xs text-primary-600 hover:text-primary-500 underline">
                    Contact Support
                  </Link>
                  <span className="text-text-secondary">•</span>
                  <Link href="/for-seniors-families" className="text-xs text-primary-600 hover:text-primary-500 underline">
                    For Seniors & Families
                  </Link>
                  <span className="text-text-secondary">•</span>
                  <Link href="/for-partners" className="text-xs text-primary-600 hover:text-primary-500 underline">
                    For Partners
                  </Link>
                </div>
                {user && user.role === "senior" && (
                  <div className="mt-3 pt-3 border-t border-secondary-200">
                    <p className="text-xs font-semibold text-primary-700 mb-2">Your Shortcuts:</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/senior/book-appointment" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Book a visit
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/senior/my-appointments" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        My appointments
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/senior/membership" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Membership
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/senior/dashboard" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Dashboard
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/contact" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Contact support
                      </Link>
                    </div>
                  </div>
                )}
                {user && user.role === "specialist" && (
                  <div className="mt-3 pt-3 border-t border-secondary-200">
                    <p className="text-xs font-semibold text-primary-700 mb-2">Your Shortcuts:</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/specialist/appointments" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        My appointments
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/specialist/earnings" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        View earnings
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/specialist/calendar" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Manage availability
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/specialist/dashboard" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Dashboard
                      </Link>
                      <span className="text-text-secondary">•</span>
                      <Link href="/contact" className="text-xs text-primary-600 hover:text-primary-500 underline">
                        Contact support
                      </Link>
                    </div>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-secondary-200">
                  <p className="text-xs text-text-secondary italic">
                    Note: HITS Assistant is a virtual assistant, not a live human. For emergencies, contact your bank and local law enforcement.
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-white text-text-primary border border-secondary-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-secondary-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-secondary-200 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

