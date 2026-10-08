"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Loader2,
  GraduationCap,
  ShieldAlert,
  Building,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

const DEMO_ACCOUNTS = [
  {
    role: "student",
    name: "Aarav Sharma",
    id: "2024BCSE042",
    email: "aarav.sharma@vit.edu",
    desc: "2nd Year B.Tech CSE (Lost Hydro Flask owner)",
    badge: "Student",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    role: "student",
    name: "Riya Patel",
    id: "2023BIT088",
    email: "riya.patel@vit.edu",
    desc: "3rd Year B.Tech IT (AirPods reporter)",
    badge: "Student",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    role: "security",
    name: "Kailash Jadhav",
    id: "SEC-402",
    email: "security.desk@vit.edu",
    desc: "Main Security Desk (Front Gate Drop-Off)",
    badge: "Security",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    role: "admin",
    name: "Dr. Sunita Deshmukh",
    id: "FAC-1002",
    email: "admin.lostfound@vit.edu",
    desc: "Lost & Found Faculty Coordinator",
    badge: "Admin",
    badgeColor: "bg-purple-100 text-purple-800",
  },
];

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { login, user } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please provide your Student ID or institutional email.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(identifier.trim(), password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Login failed. Verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (accountIdentifier: string) => {
    setIdentifier(accountIdentifier);
    setIsLoading(true);
    setError("");

    try {
      await login(accountIdentifier, "demo123");
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to log in with demo account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1F4D] text-[#F5C542] shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0B1F4D] sm:text-3xl">
          Institutional Login Portal
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Vishwakarma Institute of Technology &bull; Single Sign-On &amp; Student ID Verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Login Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-[#0B1F4D]">Sign In to Your Account</h2>
            <p className="mt-1 text-xs text-slate-500">
              Access your personal lost/found reports, review AI matches, and verify claim handovers.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Student ID or Campus Email
                </label>
                <div className="mt-1.5 relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 2024BCSE042 or aarav.sharma@vit.edu"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Campus Password / PIN
                  </label>
                  <span className="text-[11px] text-slate-400">Demo PIN: Any / Blank</span>
                </div>
                <div className="mt-1.5 relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-lg bg-[#0B1F4D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69] transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#F5C542]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 text-[#F5C542]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <Link
                href="/"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition underline"
              >
                Continue browsing as Guest (No login required) &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Quick Demo Accounts Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Quick Demo Accounts
                </h3>
                <p className="text-[11px] text-slate-500">1-click login for presentations</p>
              </div>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Live Profiles
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc.id)}
                  disabled={isLoading}
                  className="w-full text-left rounded-lg border border-slate-200 p-3 hover:border-[#0B1F4D] hover:bg-slate-50/70 transition flex items-start justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#0B1F4D] group-hover:underline">
                        {acc.name}
                      </span>
                      <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-600">ID: {acc.id}</p>
                    <p className="text-[10px] text-slate-400">{acc.desc}</p>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-[#0B1F4D] shrink-0 mt-1 font-bold">
                    &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-1">Institutional Privacy Notice:</span>
            Student enrollment numbers and contact information are encrypted under institutional data compliance policies.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-slate-500">
          Loading login portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
