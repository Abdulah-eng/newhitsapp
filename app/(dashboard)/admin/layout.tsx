"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Shield, 
  Settings,
  FileText,
  Activity,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !hasRedirected.current) {
      if (!user) {
        hasRedirected.current = true;
        router.push("/login");
        return;
      }
      
      // Check if user is admin by role or email
      const isAdmin = user.role === "admin" || user.email?.toLowerCase() === "admin@hitsapp.com";
      
      if (user.role === undefined) {
        // Wait a bit for role to be fetched
        const timer = setTimeout(() => {
          const stillAdmin = user.role === "admin" || user.email?.toLowerCase() === "admin@hitsapp.com";
          if (!stillAdmin && !hasRedirected.current) {
            hasRedirected.current = true;
            router.push("/login");
          }
        }, 2000); // Increased timeout to allow DB fetch
        return () => clearTimeout(timer);
      }
      
      if (!isAdmin) {
        hasRedirected.current = true;
        if (user.role === "senior") {
          router.replace("/senior/dashboard");
        } else if (user.role === "specialist") {
          router.replace("/specialist/dashboard");
        } else {
          router.replace("/login");
        }
      }
    }
  }, [user, loading, router]);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/payments", label: "Payments", icon: DollarSign },
    { href: "/admin/disputes", label: "Disputes", icon: FileText },
    { href: "/admin/security", label: "Security", icon: Shield },
    { href: "/admin/logs", label: "Activity Logs", icon: Activity },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  // Check if user is admin by role or email
  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase() === "admin@hitsapp.com";
  
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-secondary-200 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-secondary-200">
            <h1 className="text-2xl font-bold text-primary-500">H.I.T.S. Admin</h1>
            <p className="text-sm text-text-secondary mt-1">Administration Panel</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-primary hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-secondary-200">
            <div className="mb-4 px-4 py-2">
              <p className="text-sm font-medium text-text-primary">
                {user.user_metadata?.full_name || "Admin"}
              </p>
              <p className="text-xs text-text-secondary">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-secondary-200">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary hidden sm:block">
                Welcome, {user.user_metadata?.full_name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

