"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [pendingMatches, setPendingMatches] = useState<number>(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [latestMatchId, setLatestMatchId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Poll pending matches for live updates
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
  }, []);

  const navItems = [
    { name: "Browse Items", href: "/", icon: Search },
    { name: "Report Item", href: "/report", icon: PlusCircle },
    { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Verification Queue", href: "/admin/reports", icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F4D] text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="text-xl font-bold tracking-tight text-[#F5C542]">C</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-[#0B1F4D]">CampusFind</span>
                <span className="rounded bg-[#F5C542]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#0B1F4D]">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Lost & Found Management</p>
            </div>
          </Link>

          <nav className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-[#0B1F4D] font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#0B1F4D]" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {/* Institution Selector */}
          <div className="hidden xl:flex items-center space-x-2 text-xs bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-900">Vishwakarma Institute (VIT)</span>
          </div>

          {/* Quick Notification Dropdown for Matches */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
              title="Match Notifications"
            >
              <Bell className="h-5 w-5" />
              {pendingMatches > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                  {pendingMatches}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Match Alerts</h4>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                    {pendingMatches} Pending
                  </span>
                </div>
                <div className="py-2 text-xs text-slate-600">
                  {pendingMatches > 0 ? (
                    <div>
                      <p className="font-medium text-slate-900">AI Matching Engine detected candidate pairs!</p>
                      <p className="mt-1 text-slate-500">Review confidence breakdown and confirm ownership.</p>
                      {latestMatchId && (
                        <Link
                          href={`/match/${latestMatchId}`}
                          onClick={() => setNotificationOpen(false)}
                          className="mt-2.5 block text-center rounded bg-[#0B1F4D] py-1.5 text-xs font-semibold text-white hover:bg-[#132d69]"
                        >
                          Review Candidate Match &rarr;
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-3 text-center">No unreviewed matches right now.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B1F4D] text-[#F5C542] text-[11px] font-bold">
                  {user.full_name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block font-semibold text-slate-900 leading-tight">
                    {user.full_name}
                  </span>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {user.role}
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#0B1F4D]">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {user.student_id && (
                      <p className="mt-1 text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                        ID: {user.student_id}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    {(user.role === "admin" || user.role === "security") && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <LogIn className="h-3.5 w-3.5 text-[#0B1F4D]" />
              <span>Log In</span>
            </Link>
          )}

          {/* Action CTA */}
          <Link
            href="/report"
            className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-[#0B1F4D] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#132d69]"
          >
            <PlusCircle className="h-4 w-4 text-[#F5C542]" />
            <span>Report Item</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-slate-100 text-[#0B1F4D] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#0B1F4D]" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between py-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-slate-500">{user.student_id || user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-600 font-semibold"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center rounded-lg bg-[#0B1F4D] py-2 text-xs font-semibold text-white"
              >
                Log In to Campus Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
