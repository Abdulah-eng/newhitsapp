"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { staggerContainer, staggerItem } from "@/lib/animations/config";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export default function StaggerContainer({
  children,
  className = "",
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

