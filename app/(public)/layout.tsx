"use client";

import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary-100">
      <MarketingHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

