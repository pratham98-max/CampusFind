"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { login } = useAuth();
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
      setError(err.message || "Invalid credentials. Please verify your Student ID or institutional email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      {/* Institutional Top Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1F4D] text-[#F5C542] shadow-sm">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="mt-3 inline-flex items-center space-x-1.5 rounded-full bg-[#0B1F4D]/10 px-3 py-1 text-xs font-semibold text-[#0B1F4D]">
          <span>Vishwakarma Institute of Technology</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D]">
          Campus Single Sign-On
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your official Student ID or campus credentials to access the Lost &amp; Found registry.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Student ID or Institutional Email
            </label>
            <div className="mt-1.5 relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. 2024BCSE042 or student@vit.edu"
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10 font-mono text-xs sm:text-sm"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Enter your college enrollment registration number or email.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password / Security PIN
            </label>
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
            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-[#0B1F4D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69] transition disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#F5C542]" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
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

      {/* Security Notice */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-center text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5 text-slate-400" />
        <span>Protected by Institutional Identity Management</span>
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
