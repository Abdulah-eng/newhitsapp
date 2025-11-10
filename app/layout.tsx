import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "H.I.T.S. - Hire I.T. Specialists | Tech Support for Seniors",
  description:
    "Connect with vetted IT specialists for personalized technology support. User-friendly platform designed for seniors.",
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
      </body>
    </html>
  );
}
