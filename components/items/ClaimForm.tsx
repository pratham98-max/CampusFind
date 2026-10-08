"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Building,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ClaimFormProps {
  matchId: string;
  itemId: string;
  itemTitle: string;
  existingClaim?: any | null;
  onClaimUpdated?: (claim: any) => void;
}

export default function ClaimForm({
  matchId,
  itemId,
  itemTitle,
  existingClaim,
  onClaimUpdated,
}: ClaimFormProps) {
  const [studentId, setStudentId] = useState("");
  const [claim, setClaim] = useState<any | null>(existingClaim || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError("Please enter your Student ID / Registration Number to verify ownership.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          student_id_input: studentId.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit verification claim.");
      }

      const data = await res.json();
      setClaim(data.claim);
      setSuccessMsg("Claim submitted! Ready for Security / Admin ID verification.");
      if (onClaimUpdated) onClaimUpdated(data.claim);
    } catch (err: any) {
      setError(err.message || "Failed to submit claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminVerify = async () => {
    if (!claim?.id) return;

    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch(`/api/claims/${claim.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "usr-admin-deshmukh" }),
      });

      if (!res.ok) throw new Error("Failed to verify claim.");

      const data = await res.json();
      setClaim(data.claim);
      setSuccessMsg("Student ID Verified! Item status transitioned to 'Returned'.");

      // Trigger celebratory confetti for item recovery!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (confettiErr) {
        // Safe fallback
      }

      if (onClaimUpdated) onClaimUpdated(data.claim);
    } catch (err: any) {
      setError(err.message || "Failed to verify claim.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1F4D] text-[#F5C542]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1F4D]">Institutional ID Claim Verification</h3>
            <p className="text-[11px] text-slate-500">Security checkpoint validation before physical handover</p>
          </div>
        </div>
        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
          Stage 3: Verification
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {!claim ? (
        <form onSubmit={handleSubmitClaim} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Student ID or Registration Number <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1.5 relative">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 2024BCSE042 or 2023BIT088"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10 font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Enter your college Registration / Student ID matching your official enrollment record.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 rounded-lg bg-[#0B1F4D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69] disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5C542]" />
                <span>Submitting Claim...</span>
              </>
            ) : (
              <>
                <span>Submit Claim for Verification</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#F5C542]" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Submitted Student ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {claim.student_id_input}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Verification Status:</span>
              {claim.verified ? (
                <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  Verified & Handed Over
                </span>
              ) : (
                <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  Pending Admin Approval
                </span>
              )}
            </div>
          </div>

          {!claim.verified && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Admin / Security Validation Check</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Authorized security personnel can cross-reference physical ID card with student record.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAdminVerify}
                  disabled={isVerifying}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50 transition flex items-center space-x-1.5"
                >
                  {isVerifying ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Verify & Return Item</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
