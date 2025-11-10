"use client";

import { useEffect, useState, useCallback } from "react";
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

  const fetchMessages = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (appointmentId) {
        query = query.eq("appointment_id", appointmentId);
      } else if (otherUserId) {
        // Fetch conversation between current user and other user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          query = query.or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
          );
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setMessages((data as Message[]) || []);
    } catch (err) {
      setError("Failed to fetch messages");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, otherUserId, enabled, supabase]);

  useEffect(() => {
    fetchMessages();

    if (!enabled) return;

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages:${appointmentId || otherUserId || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: appointmentId
            ? `appointment_id=eq.${appointmentId}`
            : otherUserId
            ? `or(sender_id=eq.${otherUserId},receiver_id=eq.${otherUserId})`
            : undefined,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as Message]);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

      const { data, error: sendError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          appointment_id: appointmentId || null,
          content,
          attachments: attachments || [],
        })
        .select()
        .single();

      if (sendError) {
        setError(sendError.message);
        return null;
      }

      return data as Message;
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

