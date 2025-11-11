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
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Error fetching conversations:", messagesError);
      setIsLoading(false);
      return;
    }

    if (!messages || messages.length === 0) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    // Get unique user IDs (senders and receivers)
    const userIds = new Set<string>();
    messages.forEach((msg: any) => {
      if (msg.sender_id) userIds.add(msg.sender_id);
      if (msg.receiver_id) userIds.add(msg.receiver_id);
    });

    // Fetch user details
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, avatar_url")
      .in("id", Array.from(userIds));

    if (usersError) {
      console.error("Error fetching user details:", usersError);
    }

    // Create a map of user IDs to user data
    const usersMap = new Map<string, any>();
    usersData?.forEach((u: any) => {
      usersMap.set(u.id, u);
    });

    // Group messages by conversation
    const conversationMap = new Map<string, Conversation>();

    messages.forEach((msg: any) => {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const otherUser = usersMap.get(otherUserId) || { id: otherUserId, full_name: "Unknown", avatar_url: null };
      const conversationKey = otherUserId;

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

