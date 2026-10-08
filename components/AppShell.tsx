"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { X } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // When on login page, DO NOT show navigation or sidebar!
  if (pathname === "/login") {
    return <main className="min-h-screen bg-slate-50/60">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="absolute right-2 top-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <TopBar onToggleMobileMenu={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              &copy; 2026 Vishwakarma Institute of Technology &bull; Campus Lost &amp; Found Portal
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              pgvector 384-dim semantic matching
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
