"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
}

function PageTransitionContent({ children }: PageTransitionProps) {
  // Always call usePathname hook - don't conditionally call it
  const pathname = usePathname();

  // Simple fade transition without AnimatePresence to avoid unmounting issues
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PageTransitionContent>{children}</PageTransitionContent>
    </Suspense>
  );
}

