"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsPanel from "@/components/admin/StatsPanel";
import LiveFeed from "@/components/admin/LiveFeed";
import {
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Error loading admin stats:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleResetDemoSeed = async () => {
    if (!confirm("Reset database to initial realistic seed state for demo replay?")) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (res.ok) {
        setNotificationMsg("Demo database successfully reset to clean seed state.");
        await loadStats();
      }
    } catch (e) {
      console.error("Error resetting demo:", e);
    } finally {
      setIsResetting(false);
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Top Header */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#0B1F4D] px-2 py-0.5 text-xs font-bold text-[#F5C542]">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-600 font-semibold">
                Vishwakarma Institute of Technology
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D] sm:text-3xl">
              Operations &amp; Resolution Command
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Live monitoring of campus lost reports, automated AI match engine triggers, and student ID claim verifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/reports"
              className="inline-flex items-center space-x-1.5 rounded-lg bg-[#0B1F4D] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69] transition"
            >
              <ShieldCheck className="h-4 w-4 text-[#F5C542]" />
              <span>Verification Queue</span>
              {stats?.pendingClaimsCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {stats.pendingClaimsCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={handleResetDemoSeed}
              disabled={isResetting}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
              title="Reset database to seed state for demo replay"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Resetting..." : "Reset Demo Data"}</span>
            </button>
          </div>
        </div>

        {notificationMsg && (
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
            {notificationMsg}
          </div>
        )}
      </div>

      {isLoading || !stats ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-slate-200 mx-auto rounded"></div>
          <div className="h-32 bg-slate-100 rounded"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics Panels */}
          <StatsPanel stats={stats} />

          {/* Realtime Live Feed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <LiveFeed
                initialEvents={stats.recentEvents || []}
                onStatsRefresh={loadStats}
              />
            </div>

            {/* Quick Actions & System Health */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Security Quick Actions
                </h3>

                <Link
                  href="/report?type=found"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <PlusCircle className="h-4 w-4 text-[#0B1F4D]" />
                    <span>Log Handed-Over Item</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Verify Pending Student Claims</span>
                  </div>
                  <span className="font-mono text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {stats.pendingClaimsCount} Pending
                  </span>
                </Link>

                <Link
                  href="/"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Public Item Directory</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 text-xs text-slate-600 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>pgvector Engine Status:</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono text-[10px]">
                    ONLINE (384-DIM)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Active semantic model: `all-MiniLM-L6-v2`. Automatic background cosine vector indexing operational.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
