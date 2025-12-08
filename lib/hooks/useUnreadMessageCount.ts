"use client";

import { useCallback, useEffect, useState } from "react";

export function useUnreadMessageCount(pollInterval = 60000) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/unread-count", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 401) {
        setCount(0);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch unread messages");
      }

      const data = await response.json();
      setCount(typeof data.count === "number" ? data.count : 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load unread count");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    let interval = setInterval(fetchCount, pollInterval);

    // Pause polling when tab hidden to reduce load
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearInterval(interval);
      } else {
        fetchCount();
        interval = setInterval(fetchCount, pollInterval);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const handler = (event: Event) => {
      const custom = event as CustomEvent;
      if (typeof custom.detail === "number") {
        setCount(custom.detail);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("unread-messages-updated", handler);
    }
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (typeof window !== "undefined") {
        window.removeEventListener("unread-messages-updated", handler);
      }
    };
  }, [fetchCount, pollInterval]);

  return { count, isLoading, error, refetch: fetchCount, setCount };
}


