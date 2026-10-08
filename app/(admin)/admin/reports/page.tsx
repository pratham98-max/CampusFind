"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
  Tag,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function AdminReportsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const loadClaims = async () => {
    try {
      const res = await fetch("/api/claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (e) {
      console.error("Error loading claims:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleVerify = async (claimId: string) => {
    setVerifyingId(claimId);
    setMsg("");
    try {
      const res = await fetch(`/api/claims/${claimId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "usr-admin-deshmukh" }),
      });

      if (!res.ok) throw new Error("Failed to verify claim");

      setMsg("Claim verified successfully! Item marked returned.");
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {}
      await loadClaims();
    } catch (err: any) {
      setMsg(err.message || "Failed to verify claim.");
    } finally {
      setVerifyingId(null);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const pendingClaims = claims.filter((c) => !c.verified);
  const verifiedClaims = claims.filter((c) => c.verified);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#0B1F4D] px-2 py-0.5 text-xs font-bold text-[#F5C542]">
                SECURITY QUEUE
              </span>
              <span className="text-xs text-slate-500">Student ID Verification</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D]">
              Claim Handover Verification
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Cross-reference official enrollment credentials against physical belongings before final hand-off.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>&larr; Admin Dashboard</span>
          </Link>
        </div>

        {msg && (
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
            {msg}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading verification queue...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Claims Section */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Awaiting Student ID Verification ({pendingClaims.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Action Required</span>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All submitted claims have been verified. No pending items in queue.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingClaims.map((claim) => (
                  <div key={claim.id} className="p-6 transition hover:bg-slate-50/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="rounded bg-[#0B1F4D] px-2 py-0.5 text-xs font-bold text-white">
                            Claim ID: #{claim.id.substring(0, 8)}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            ID: {claim.student_id_input}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center">
                            <User className="mr-1 h-3.5 w-3.5 text-slate-400" />
                            Claimant: <strong className="ml-1 text-slate-900">{claim.claimant?.full_name || "Aarav Sharma"}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>Submitted: {formatDate(claim.created_at)}</span>
                        </div>

                        {/* Item Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Lost Item</span>
                            <span className="font-bold text-[#0B1F4D] text-sm block mt-0.5">
                              {claim.lost_item?.title || "Item"}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {claim.lost_item?.location}
                            </span>
                          </div>

                          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Recovered Found Item</span>
                            <span className="font-bold text-emerald-800 text-sm block mt-0.5">
                              {claim.found_item?.title || "Found Item"}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {claim.found_item?.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Verification Action */}
                      <div className="shrink-0 flex flex-col items-end space-y-2">
                        <button
                          type="button"
                          onClick={() => handleVerify(claim.id)}
                          disabled={verifyingId === claim.id}
                          className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
                        >
                          {verifyingId === claim.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Verifying ID...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 text-[#F5C542]" />
                              <span>Verify ID &amp; Mark Returned</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/item/${claim.lost_item?.id}`}
                          className="text-[11px] font-semibold text-[#0B1F4D] hover:underline"
                        >
                          Inspect Status Timeline &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Claims Archive */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Verified &amp; Returned Handover History ({verifiedClaims.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {verifiedClaims.map((claim) => (
                <div key={claim.id} className="p-5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#0B1F4D]">{claim.lost_item?.title || "Item"}</span>
                      <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                        Returned
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Verified Student ID: <span className="font-mono font-semibold text-slate-800">{claim.student_id_input}</span> &bull; Verified on {formatDate(claim.verified_at)}
                    </p>
                  </div>

                  <Link
                    href={`/item/${claim.lost_item?.id}`}
                    className="text-xs font-semibold text-slate-600 hover:text-[#0B1F4D] underline"
                  >
                    View Timeline
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
