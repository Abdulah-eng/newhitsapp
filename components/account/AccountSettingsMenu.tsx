"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, LogOut, KeyRound } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import ChangePasswordModal from "@/components/account/ChangePasswordModal";

type AccountSettingsMenuProps = {
  align?: "right" | "left";
  buttonLabel?: string;
  className?: string;
};

export default function AccountSettingsMenu({
  align = "right",
  buttonLabel = "Settings",
  className = "",
}: AccountSettingsMenuProps) {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const openMenu = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    closeTimeout.current = setTimeout(() => setIsOpen(false), 120);
  };

  const closeImmediately = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  const handleChangePassword = () => {
    closeImmediately();
    setShowModal(true);
  };

  const handleLogout = async () => {
    closeImmediately();
    await signOut();
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Button
        variant="ghost"
        size="lg"
        className="text-[18px] font-semibold text-primary-600 hover:text-primary-500 px-4 flex items-center gap-2"
        onClick={() => (isOpen ? closeImmediately() : setIsOpen(true))}
      >
        <Settings size={18} />
        <span className="hidden sm:inline">{buttonLabel}</span>
      </Button>

      {isOpen && (
        <div
          className={`absolute mt-2 w-48 rounded-xl border border-secondary-200 bg-white shadow-xl z-40 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onMouseEnter={openMenu}
        >
          <button
            className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-primary-50 rounded-t-xl"
            onClick={handleChangePassword}
          >
            <KeyRound size={16} />
            Change Password
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-error-600 hover:bg-error-50 rounded-b-xl"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      <ChangePasswordModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}


