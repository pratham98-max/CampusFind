"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  LogOut,
  Building2,
  PhoneCall,
  Clock,
  User,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useState, useEffect } from "react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [pendingMatches, setPendingMatches] = useState<number>(0);
  const [pendingClaims, setPendingClaims] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [matchRes, statsRes] = await Promise.all([
          fetch("/api/matches/pending"),
          fetch("/api/admin/stats"),
        ]);
        if (matchRes.ok) {
          const matches = await matchRes.json();
          setPendingMatches(matches.length || 0);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setPendingClaims(statsData.stats?.pendingClaimsCount || 0);
          setTotalItems(statsData.stats?.totalReports || 0);
        }
      } catch (e) {
        // Safe fallback
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    if (onCloseMobile) onCloseMobile();
    window.location.href = "/login";
  };

  const navSections = [
    {
      label: "CAMPUS REGISTRY",
      items: [
        {
          name: "Item Directory",
          href: "/",
          icon: Search,
          badge: totalItems > 0 ? `${totalItems}` : undefined,
          badgeColor: "bg-slate-100 text-slate-700",
        },
        {
          name: "Report Belonging",
          href: "/report",
          icon: PlusCircle,
          accent: true,
        },
        {
          name: "Student Profile",
          href: "/profile",
          icon: GraduationCap,
        },
      ],
    },
    {
      label: "SECURITY & RESOLUTION",
      items: [
        {
          name: "Operations Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Verification Queue",
          href: "/admin/reports",
          icon: ShieldCheck,
          badge: pendingClaims > 0 ? `${pendingClaims}` : undefined,
          badgeColor: "bg-amber-100 text-amber-800",
        },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center space-x-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F4D] text-[#F5C542] shadow-sm transition-transform group-hover:scale-105">
            <span className="text-xl font-bold tracking-tight">C</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold tracking-tight text-[#0B1F4D]">
                CampusFind
              </span>
              <span className="rounded bg-[#F5C542]/20 px-1.5 py-0.2 text-[9px] font-bold text-[#0B1F4D]">
                VIT
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Lost &amp; Found System
            </p>
          </div>
        </Link>

        {/* Institutional Campus Picker */}
        <div className="mt-3.5 flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 text-[11px] text-slate-700">
          <div className="flex items-center space-x-2 truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-semibold truncate">VIT Pune Main Campus</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Live</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((sec) => (
          <div key={sec.label} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              {sec.label}
            </h3>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#0B1F4D] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? "text-[#F5C542]"
                            : item.accent
                            ? "text-[#0B1F4D]"
                            : "text-slate-400"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* AI Vector Matching Live Monitor Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[11px] font-bold text-[#0B1F4D]">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Vector Engine</span>
            </span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            pgvector 384-dim semantic similarity continuously indexing incoming reports.
          </p>
          {pendingMatches > 0 && (
            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-[10px] font-semibold text-amber-700 flex items-center">
                &bull; {pendingMatches} candidate match{pendingMatches > 1 ? "es" : ""} awaiting review
              </span>
            </div>
          )}
        </div>

        {/* Campus Security Contact Pill */}
        <div className="rounded-lg border border-dashed border-slate-200 p-3 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
            <PhoneCall className="h-3 w-3 text-slate-400" />
            <span>Campus Security Desk</span>
          </div>
          <p className="text-[10px] text-slate-500">
            24/7 Gate 2 Office &bull; Ext. 402
          </p>
        </div>
      </div>

      {/* User Profile Footer Dock */}
      {user && (
        <div className="border-t border-slate-200 p-3 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              onClick={onCloseMobile}
              className="flex items-center space-x-2.5 truncate group hover:opacity-85 transition"
              title="View & Edit Student Profile"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F4D] text-[#F5C542] text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                {user.full_name.charAt(0)}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-[#0B1F4D]">
                  {user.full_name}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="rounded bg-slate-200/80 px-1.2 py-0.2 text-[9px] font-bold uppercase text-slate-700">
                    {user.role}
                  </span>
                  {user.student_id && (
                    <span className="font-mono text-[10px] text-slate-500 truncate">
                      {user.student_id}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
