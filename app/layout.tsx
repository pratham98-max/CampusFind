import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CampusFind | Lost & Found Institutional Portal",
  description: "Enterprise Lost and Found platform with AI-powered smart matching, Student ID verification, and real-time resolution tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#0B1F4D]">CampusFind Enterprise</span>
              <span>— Lost & Found Management for Colleges, Schools & Hospitals</span>
            </div>
            <div className="flex items-center space-x-6 text-slate-400">
              <span>S4I Hackathon Prototype</span>
              <span>&bull;</span>
              <span>Next.js 14 + Supabase pgvector</span>
              <span>&bull;</span>
              <span className="text-[#0B1F4D] font-medium">Status: Live</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
