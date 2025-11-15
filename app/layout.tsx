import type { Metadata } from "next";
import "./globals.css";
import ClientChatbotWrapper from "@/components/ClientChatbotWrapper";

export const metadata: Metadata = {
  title: "HITS – Hire I.T. Specialist | Tech Support for Seniors",
  description:
    "Calm, patient tech help for seniors, disabled adults, and the families who love them. Connect with vetted IT specialists for personalized technology support.",
  keywords: [
    "tech support",
    "senior technology",
    "IT specialists",
    "computer help",
    "senior-friendly tech",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <ClientChatbotWrapper />
      </body>
    </html>
  );
}
