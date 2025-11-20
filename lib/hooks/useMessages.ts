"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

interface UseMessagesOptions {
  appointmentId?: string;
  otherUserId?: string;
  enabled?: boolean;
}

export function useMessages(options: UseMessagesOptions = {}) {
  const { appointmentId, otherUserId, enabled = true } = options;
  const supabase = createSupabaseBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (appointmentId) {
        query = query.eq("appointment_id", appointmentId);
      } else if (otherUserId) {
        // Fetch conversation between current user and other user
        query = query.or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        );
      } else {
        // If no filters, don't fetch anything
        setMessages([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching messages:", fetchError);
        setError(fetchError.message);
        setMessages([]);
        setIsLoading(false);
        return;
      }

      console.log("Fetched messages:", data?.length || 0, data);
      setMessages((data as Message[]) || []);
    } catch (err: any) {
      console.error("Exception fetching messages:", err);
      setError(err.message || "Failed to fetch messages");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, otherUserId, enabled, supabase]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    fetchMessages();

    // Set up real-time subscription
    let isMounted = true;

    const setupSubscription = async () => {
      // Get current user for proper filtering
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) {
        return;
      }

      let filter: string | undefined;

      if (appointmentId) {
        filter = `appointment_id=eq.${appointmentId}`;
      } else if (otherUserId) {
        // Filter for messages between current user and other user
        // This ensures we only get messages in this specific conversation
        filter = `or(and(sender_id=eq.${user.id},receiver_id=eq.${otherUserId}),and(sender_id=eq.${otherUserId},receiver_id=eq.${user.id}))`;
      } else {
        return; // No valid filter, don't subscribe
      }

      const channelName = `messages:${appointmentId || otherUserId || "all"}-${user.id}`;
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: filter,
          },
          (payload) => {
            if (!isMounted) return;
            
            console.log("Real-time message event:", payload.eventType, payload.new || payload.old);
            
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message;
              // Check if message already exists to avoid duplicates
              setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === newMessage.id);
                if (exists) {
                  console.log("Message already exists, skipping:", newMessage.id);
                  return prev;
                }
                console.log("Adding new message via real-time:", newMessage);
                // Sort messages by created_at to maintain order
                const updated = [...prev, newMessage].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                return updated;
              });
            } else if (payload.eventType === "UPDATE") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === payload.new.id ? (payload.new as Message) : msg
                )
              );
            } else if (payload.eventType === "DELETE") {
              setMessages((prev) =>
                prev.filter((msg) => msg.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("✅ Successfully subscribed to real-time messages");
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Error subscribing to real-time messages");
          }
        });

      channelRef.current = channel;
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log("Cleaning up real-time subscription");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchMessages, appointmentId, otherUserId, enabled, supabase]);

  const sendMessage = useCallback(
    async (
      receiverId: string,
      content: string,
      attachments?: Array<{ url: string; name: string; type: string; size: number }>
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to send messages");
        return null;
      }

      const trimmed = content.trim();
      if (!trimmed) {
        return null;
      }

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        receiver_id: receiverId,
        appointment_id: appointmentId || undefined,
        content: trimmed,
        attachments: attachments || [],
        created_at: new Date().toISOString(),
        read_at: undefined,
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId,
            content: trimmed,
            appointmentId: appointmentId || null,
            attachments: attachments || [],
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to send message");
        }

        const data = await response.json();
        const realMessage = data.message as Message;

        setMessages((prev) =>
          [...prev.filter((msg) => msg.id !== tempMessage.id), realMessage].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        );

        return realMessage;
      } catch (err: any) {
        console.error("Error sending message:", err);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setError(err.message || "Failed to send message");
        return null;
      }
    },
    [appointmentId, supabase]
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId);

      if (updateError) {
        console.error("Error marking message as read:", updateError);
      }
    },
    [supabase]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}

