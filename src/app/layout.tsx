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
  title: "CoreX — Fast & Secure Proxy Platform",
  description: "CoreX provides fast and secure proxy subscriptions. Connect with VLESS, VMess, Trojan, Shadowsocks and more through our Clash-powered app.",
  keywords: ["CoreX", "Proxy", "VPN", "Clash", "VLESS", "VMess", "Trojan", "Shadowsocks"],
  authors: [{ name: "CoreX Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CoreX — Fast & Secure Proxy Platform",
    description: "Fast and secure proxy subscriptions powered by Clash",
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
