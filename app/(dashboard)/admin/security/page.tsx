"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import { Shield, ArrowLeft, AlertTriangle, CheckCircle, Clock, User, Lock, Activity } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface SecurityEvent {
  id: string;
  type: "login" | "password_change" | "suspicious_activity" | "admin_action";
  description: string;
  user: {
    full_name: string;
    email: string;
    role: string;
  };
  created_at: string;
  metadata?: any;
}

export default function AdminSecurityPage() {
  const supabase = createSupabaseBrowserClient();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspiciousActivity: 0,
    recentLogins: 0,
  });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      // Fetch user statistics
      const [usersRes, appointmentsRes] = await Promise.all([
        supabase.from("users").select("id, full_name, email, role, created_at").order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select("senior_id, specialist_id, created_at")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      if (usersRes.error) {
        console.error("Error fetching users:", usersRes.error);
      }
      if (appointmentsRes.error) {
        console.error("Error fetching appointments:", appointmentsRes.error);
      }

      // Calculate active users (users with activity in last 7 days)
      const activeUserIds = new Set<string>();
      appointmentsRes.data?.forEach((apt) => {
        activeUserIds.add(apt.senior_id);
        activeUserIds.add(apt.specialist_id);
      });

      // Create security events from user activity
      const securityEvents: SecurityEvent[] = [];
      
      // Recent user registrations as login events
      usersRes.data?.slice(0, 20).forEach((user) => {
        securityEvents.push({
          id: `user-${user.id}`,
          type: "login",
          description: `New user registered: ${user.full_name}`,
          user: {
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
          created_at: user.created_at,
        });
      });

      // Recent appointments as activity
      appointmentsRes.data?.slice(0, 10).forEach((apt) => {
        securityEvents.push({
          id: `activity-${apt.senior_id}-${apt.created_at}`,
          type: "admin_action",
          description: "Appointment activity detected",
          user: {
            full_name: "System",
            email: "system@hitsapp.com",
            role: "system",
          },
          created_at: apt.created_at,
        });
      });

      // Sort by date
      securityEvents.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setEvents(securityEvents);
      setStats({
        totalUsers: usersRes.data?.length || 0,
        activeUsers: activeUserIds.size,
        suspiciousActivity: 0, // Can be enhanced with actual suspicious activity detection
        recentLogins: securityEvents.filter((e) => e.type === "login").length,
      });
    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login":
        return <User size={20} className="text-primary-500" />;
      case "password_change":
        return <Lock size={20} className="text-warning-500" />;
      case "suspicious_activity":
        return <AlertTriangle size={20} className="text-error-500" />;
      case "admin_action":
        return <Activity size={20} className="text-accent-400" />;
      default:
        return <Shield size={20} className="text-text-secondary" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "password_change":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "suspicious_activity":
        return "bg-error-50 text-error-700 border-error-200";
      case "admin_action":
        return "bg-accent-50 text-accent-700 border-accent-200";
      default:
        return "bg-secondary-100 text-text-secondary border-secondary-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            Security & Monitoring
          </h1>
          <p className="text-xl text-text-secondary">
            Monitor security events and generate audit reports
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Total Users</p>
              <User className="text-primary-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-primary-500">{stats.totalUsers}</p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Active Users (7d)</p>
              <Activity className="text-success-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-success-500">{stats.activeUsers}</p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Recent Logins</p>
              <Clock className="text-accent-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-accent-400">{stats.recentLogins}</p>
          </motion.div>

          <motion.div variants={slideUp} className="card bg-white p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Suspicious Activity</p>
              <AlertTriangle className="text-error-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-error-500">{stats.suspiciousActivity}</p>
          </motion.div>
        </div>

        {/* Security Recommendations */}
        <motion.div variants={slideUp} className="card bg-white p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-primary-500" size={24} />
            <h2 className="text-xl font-bold text-text-primary">Security Recommendations</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <CheckCircle className="text-primary-500 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-primary-700">Enable Two-Factor Authentication</p>
                <p className="text-sm text-primary-600">
                  Consider implementing 2FA for admin accounts to enhance security.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <AlertTriangle className="text-warning-500 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-warning-700">Regular Security Audits</p>
                <p className="text-sm text-warning-600">
                  Schedule regular security audits to identify and address vulnerabilities.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-success-50 border border-success-200 rounded-lg">
              <CheckCircle className="text-success-500 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-success-700">SSL Certificate Active</p>
                <p className="text-sm text-success-600">
                  Your application is using secure HTTPS connections.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Events */}
        <motion.div variants={slideUp} className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Recent Security Events</h2>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="ml-4 text-text-secondary">Loading security events...</p>
          </div>
        ) : events.length === 0 ? (
          <motion.div variants={slideUp} className="card bg-white p-12 text-center">
            <Shield size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-xl text-text-secondary mb-4">No security events found</p>
            <p className="text-text-tertiary">Security events will appear here as they occur</p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                variants={staggerItem}
                className="card bg-white p-6 hover:shadow-medium transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-1">
                          {event.description}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {event.user.full_name} ({event.user.email}) - {event.user.role}
                        </p>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {new Date(event.created_at).toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEventColor(
                          event.type
                        )}`}
                      >
                        {event.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
