"use client";

import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface StatsPanelProps {
  stats: {
    totalLost: number;
    totalFound: number;
    totalReports: number;
    totalReturned: number;
    totalMatched: number;
    resolutionRate: number;
    averageTimeToMatchHours: number;
    categoryDistribution: Record<string, number>;
    pendingClaimsCount: number;
    activeMatchesCount: number;
  };
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const metricCards = [
    {
      title: "Resolution Rate",
      value: `${stats.resolutionRate}%`,
      subtitle: `${stats.totalReturned} of ${stats.totalReports} items returned`,
      icon: CheckCircle2,
      trend: "+12% this month",
      trendPositive: true,
      accent: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Avg. Time to Match",
      value: `${stats.averageTimeToMatchHours}h`,
      subtitle: "From report to confirmed pairing",
      icon: Clock,
      trend: "-1.4h vs manual register",
      trendPositive: true,
      accent: "text-blue-700 bg-blue-50",
    },
    {
      title: "Active Reports in System",
      value: stats.totalReports.toString(),
      subtitle: `${stats.totalLost} Lost • ${stats.totalFound} Found`,
      icon: Package,
      trend: `${stats.activeMatchesCount} pending AI matches`,
      trendPositive: null,
      accent: "text-indigo-700 bg-indigo-50",
    },
    {
      title: "Student Verification Queue",
      value: stats.pendingClaimsCount.toString(),
      subtitle: "Claims requiring security check",
      icon: ShieldCheck,
      trend: stats.pendingClaimsCount > 0 ? "Action required" : "Queue clear",
      trendPositive: stats.pendingClaimsCount === 0,
      accent: stats.pendingClaimsCount > 0 ? "text-amber-700 bg-amber-50" : "text-slate-700 bg-slate-50",
    },
  ];

  const totalCatCount = Object.values(stats.categoryDistribution || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* 4 Dense Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className={`rounded-lg p-2 ${card.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-[#0B1F4D]">
                  {card.value}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span>{card.subtitle}</span>
                {card.trend && (
                  <span
                    className={`font-medium ${
                      card.trendPositive === true
                        ? "text-emerald-600"
                        : card.trendPositive === false
                        ? "text-amber-600 font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {card.trend}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown Dense Bar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-[#0B1F4D]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Items by Category Breakdown
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total {totalCatCount} Items
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {Object.entries(stats.categoryDistribution || {}).map(([cat, count]) => {
            const pct = Math.round((count / totalCatCount) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700">
                  <span className="font-medium">{cat}</span>
                  <span className="text-slate-500 font-mono">
                    {count} items ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0B1F4D]"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
