"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Conversation {
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  lastMessage: {
    content: string;
    created_at: string;
    read_at: string | null;
  };
  unreadCount: number;
  appointmentId?: string;
}

export function useConversations() {
  const supabase = createSupabaseBrowserClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for new messages
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchConversations();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchConversations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*, sender:sender_id(id, full_name, avatar_url), receiver:receiver_id(id, full_name, avatar_url)")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      setIsLoading(false);
      return;
    }

    // Group messages by conversation
    const conversationMap = new Map<string, Conversation>();

    messages?.forEach((msg: any) => {
      const otherUser =
        msg.sender_id === user.id ? msg.receiver : msg.sender;
      const conversationKey = otherUser.id;

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          otherUser: {
            id: otherUser.id,
            full_name: otherUser.full_name,
            avatar_url: otherUser.avatar_url,
          },
          lastMessage: {
            content: msg.content,
            created_at: msg.created_at,
            read_at: msg.read_at,
          },
          unreadCount: 0,
          appointmentId: msg.appointment_id,
        });
      } else {
        const conv = conversationMap.get(conversationKey)!;
        if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
          conv.lastMessage = {
            content: msg.content,
            created_at: msg.created_at,
            read_at: msg.read_at,
          };
        }
        if (!msg.read_at && msg.receiver_id === user.id) {
          conv.unreadCount++;
        }
      }
    });

    setConversations(Array.from(conversationMap.values()));
    setIsLoading(false);
  };

  return { conversations, isLoading, refetch: fetchConversations };
}

