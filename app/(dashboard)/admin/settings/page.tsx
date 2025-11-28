"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usePlatformSettings } from "@/lib/hooks/usePlatformSettings";
import { fadeIn, slideUp } from "@/lib/animations/config";
import { Settings, ArrowLeft, Save, Globe, DollarSign, Mail, Bell, Shield } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { settings, isLoading, updateSetting } = usePlatformSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    platformName: "HITSapp",
    platformEmail: "support@hitsapp.com",
    platformPhone: "+1 (555) 123-4567",
    defaultHourlyRate: 50,
    minHourlyRate: 20,
    maxHourlyRate: 200,
    platformFee: 15,
    currency: "USD",
    timezone: "America/New_York",
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maxAppointmentDuration: 240,
    minAppointmentDuration: 30,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        platformName: settings.platform_name || "HITSapp",
        platformEmail: settings.support_email || "support@hitsapp.com",
        platformPhone: settings.support_phone || "+1 (555) 123-4567",
        defaultHourlyRate: settings.base_hourly_rate || 95,
        minHourlyRate: 20,
        maxHourlyRate: 200,
        platformFee: 15,
        currency: "USD",
        timezone: "America/New_York",
        maintenanceMode: !settings.allow_registrations || false,
        allowNewRegistrations: settings.allow_registrations || true,
        requireEmailVerification: settings.require_email_verification || true,
        enableNotifications: true,
        maxAppointmentDuration: 240,
        minAppointmentDuration: 30,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update platform settings
      await updateSetting("platform_name", localSettings.platformName);
      await updateSetting("support_email", localSettings.platformEmail);
      await updateSetting("support_phone", localSettings.platformPhone);
      await updateSetting("base_hourly_rate", localSettings.defaultHourlyRate);
      await updateSetting("allow_registrations", localSettings.allowNewRegistrations);
      await updateSetting("require_email_verification", localSettings.requireEmailVerification);

      // Log settings update
      try {
        await fetch("/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "settings_updated",
            description: "Platform settings updated",
            metadata: {
              updated_by: user.id,
            },
          }),
        });
      } catch (err) {
        console.error("Error logging settings update:", err);
      }

      alert("Settings saved successfully!");
    } catch (error: any) {
      alert("Failed to save settings: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            System Settings
          </h1>
          <p className="text-xl text-text-secondary">
            Configure platform settings and preferences
          </p>
        </motion.div>

        {/* General Settings */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold text-text-primary">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Platform Name
              </label>
              <Input
                type="text"
                value={localSettings.platformName}
                onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Support Email
              </label>
              <Input
                type="email"
                value={localSettings.platformEmail}
                onChange={(e) => setLocalSettings({ ...localSettings, platformEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Support Phone
              </label>
              <Input
                type="tel"
                value={localSettings.platformPhone}
                onChange={(e) => setLocalSettings({ ...localSettings, platformPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Timezone
              </label>
              <select
                value={localSettings.timezone}
                onChange={(e) => setLocalSettings({ ...localSettings, timezone: e.target.value })}
                className="input"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Pricing Settings */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold text-text-primary">Pricing Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Default Hourly Rate ($)
              </label>
              <Input
                type="number"
                value={localSettings.defaultHourlyRate}
                onChange={(e) => setLocalSettings({ ...localSettings, defaultHourlyRate: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Minimum Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  value={localSettings.minHourlyRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, minHourlyRate: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Maximum Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  value={localSettings.maxHourlyRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, maxHourlyRate: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Platform Fee (%)
              </label>
              <Input
                type="number"
                value={localSettings.platformFee}
                onChange={(e) => setLocalSettings({ ...localSettings, platformFee: Number(e.target.value) })}
                min="0"
                max="100"
              />
              <p className="text-xs text-text-tertiary mt-1">
                Percentage of each transaction that goes to the platform
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Currency
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Appointment Settings */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold text-text-primary">Appointment Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Minimum Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={localSettings.minAppointmentDuration}
                  onChange={(e) => setLocalSettings({ ...localSettings, minAppointmentDuration: Number(e.target.value) })}
                  min="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Maximum Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={localSettings.maxAppointmentDuration}
                  onChange={(e) => setLocalSettings({ ...localSettings, maxAppointmentDuration: Number(e.target.value) })}
                  min="30"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security & Access Settings */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold text-text-primary">Security & Access</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Maintenance Mode</p>
                <p className="text-sm text-text-secondary">
                  Temporarily disable the platform for maintenance
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.maintenanceMode}
                  onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Allow New Registrations</p>
                <p className="text-sm text-text-secondary">
                  Enable or disable new user registrations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.allowNewRegistrations}
                  onChange={(e) => setLocalSettings({ ...localSettings, allowNewRegistrations: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Require Email Verification</p>
                <p className="text-sm text-text-secondary">
                  Require users to verify their email before accessing the platform
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.requireEmailVerification}
                  onChange={(e) => setLocalSettings({ ...localSettings, requireEmailVerification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold text-text-primary">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Enable Notifications</p>
                <p className="text-sm text-text-secondary">
                  Send email and in-app notifications to users
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.enableNotifications}
                  onChange={(e) => setLocalSettings({ ...localSettings, enableNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={slideUp} className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <Save size={18} className="mr-2" />
            Save Settings
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
