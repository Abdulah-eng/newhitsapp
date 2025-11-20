"use client";

import { useCallback, useEffect, useState } from "react";

export function useUnreadMessageCount(pollInterval = 30000) {
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
    const interval = setInterval(fetchCount, pollInterval);
    return () => clearInterval(interval);
  }, [fetchCount, pollInterval]);

  return { count, isLoading, error, refetch: fetchCount };
}


