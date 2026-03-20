import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "src/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CalorIQ - Track Smarter. Eat Better.",
  description:
    "AI-powered calorie tracking that understands natural language. Just describe what you ate and CalorIQ does the rest.",
  keywords: ["calorie tracker", "nutrition", "AI", "food logging", "health"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full`}>
        <body className="min-h-full bg-background font-sans antialiased">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
