import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface PlatformSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  support_hours: string;
  base_hourly_rate: number;
  additional_half_hour_rate: number;
  travel_hq_location: string;
  travel_included_miles: number;
  travel_rate_per_mile: number;
  specialist_hourly_rate: number;
  specialist_travel_rate_per_mile: number;
  allow_registrations: boolean;
  require_email_verification: boolean;
  enable_2fa: boolean;
  [key: string]: any;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platform_name: "HITS – Hire I.T. Specialist",
  support_email: "support@hitsapp.com",
  support_phone: "(646) 758-6606",
  support_hours: "Monday-Friday, 9am-5pm EST",
  base_hourly_rate: 95,
  additional_half_hour_rate: 45,
  travel_hq_location: "Hope Mills, NC 28348",
  travel_included_miles: 20,
  travel_rate_per_mile: 1.00,
  specialist_hourly_rate: 30.00,
  specialist_travel_rate_per_mile: 0.60,
  allow_registrations: true,
  require_email_verification: true,
  enable_2fa: false,
};

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("platform_settings")
        .select("key, value");

      if (fetchError) throw fetchError;

      // Merge settings from database with defaults
      const mergedSettings = { ...DEFAULT_SETTINGS };
      
      if (data) {
        data.forEach((item) => {
          try {
            const parsedValue = typeof item.value === "string" 
              ? JSON.parse(item.value) 
              : item.value;
            mergedSettings[item.key] = parsedValue;
          } catch (e) {
            // If parsing fails, use the value as-is
            mergedSettings[item.key] = item.value;
          }
        });
      }

      setSettings(mergedSettings);
    } catch (err: any) {
      console.error("Error fetching platform settings:", err);
      setError(err.message || "Failed to load settings");
      // Use defaults on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error: updateError } = await supabase
        .from("platform_settings")
        .upsert({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      // Update local state
      setSettings((prev) => ({ ...prev, [key]: value }));

      return { success: true };
    } catch (err: any) {
      console.error("Error updating setting:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    refetch: fetchSettings,
  };
}

