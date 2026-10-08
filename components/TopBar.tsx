"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Bell,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Search,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export default function TopBar({ onToggleMobileMenu }: TopBarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pendingMatches, setPendingMatches] = useState<number>(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [latestMatchId, setLatestMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function checkPending() {
      try {
        const matchRes = await fetch("/api/matches/pending");
        if (matchRes.ok) {
          const matches = await matchRes.json();
          setPendingMatches(matches.length || 0);
          if (matches.length > 0) {
            setLatestMatchId(matches[0].id);
          }
        }
      } catch (e) {
        // Safe fallback
      }
    }
    checkPending();
    const interval = setInterval(checkPending, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const getPageTitle = () => {
    if (pathname === "/") return "Campus Item Directory";
    if (pathname.startsWith("/report")) return "Register Lost / Found Belonging";
    if (pathname.startsWith("/admin/dashboard")) return "Operations & Resolution Command";
    if (pathname.startsWith("/admin/reports")) return "Student ID Verification Queue";
    if (pathname.startsWith("/item/")) return "Item Custody & Lifecycle Tracking";
    if (pathname.startsWith("/match/")) return "AI Match Review & Side-by-Side Diff";
    return "Institutional Portal";
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-sm">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#0B1F4D] sm:text-sm tracking-tight">
            {getPageTitle()}
          </span>
          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300"></span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400">
            VIT Campus Security Portal
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Match Alert Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 focus:outline-none transition"
            title="Match Alerts"
          >
            <Bell className="h-4 w-4" />
            {pendingMatches > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                {pendingMatches}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  AI Match Alerts
                </h4>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {pendingMatches} Pending
                </span>
              </div>
              <div className="py-2 text-xs text-slate-600">
                {pendingMatches > 0 ? (
                  <div>
                    <p className="font-semibold text-slate-900">
                      High-confidence match candidate detected!
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Review semantic cosine similarity and confirm your belongings.
                    </p>
                    {latestMatchId && (
                      <Link
                        href={`/match/${latestMatchId}`}
                        onClick={() => setNotificationOpen(false)}
                        className="mt-2.5 block text-center rounded-lg bg-[#0B1F4D] py-1.5 text-xs font-semibold text-white hover:bg-[#132d69]"
                      >
                        Inspect Candidate Match &rarr;
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 py-3 text-center text-xs">
                    No unreviewed matches at this moment.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Report CTA Button */}
        <Link
          href="/report"
          className="flex items-center space-x-1.5 rounded-lg bg-[#0B1F4D] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69] transition"
        >
          <PlusCircle className="h-3.5 w-3.5 text-[#F5C542]" />
          <span className="hidden sm:inline">Report Item</span>
        </Link>
      </div>
    </header>
  );
}
