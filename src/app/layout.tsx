import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoreX — Secure Business Platform",
  description: "CoreX is a secure business platform with top-level security architecture. Manage subscriptions, devices, and payments with confidence.",
  keywords: ["CoreX", "Security", "Business", "Platform", "Subscriptions"],
  authors: [{ name: "CoreX Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CoreX — Secure Business Platform",
    description: "Enterprise-grade security for your business operations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
