import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Second Brain - AI-Powered Knowledge Management",
  description:
    "Capture, organize, and query your knowledge with AI. Build your personal second brain with smart summaries, auto-tagging, and semantic search.",
  keywords: [
    "knowledge management",
    "second brain",
    "AI",
    "notes",
    "productivity",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
