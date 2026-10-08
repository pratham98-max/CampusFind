"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MatchConfidenceCard from "@/components/match/MatchConfidenceCard";
import { ArrowLeft, Sparkles, ShieldCheck, AlertCircle } from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatch() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (!res.ok) {
          throw new Error("Match record not found or link has expired.");
        }
        const data = await res.json();
        setMatch(data.match);
      } catch (err: any) {
        setError(err.message || "Failed to load match record.");
      } finally {
        setIsLoading(false);
      }
    }

    if (matchId) {
      loadMatch();
    }
  }, [matchId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#0B1F4D] transition"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Directory
        </Link>
        <span className="text-xs text-slate-400">Match Review Link</span>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-1/3 mx-auto bg-slate-200 rounded"></div>
          <div className="h-4 w-1/2 mx-auto bg-slate-100 rounded"></div>
          <div className="h-64 bg-slate-100 rounded-lg"></div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-3 text-base font-bold text-rose-900">Unable to Load Match</h2>
          <p className="mt-1 text-xs text-rose-700">{error}</p>
          <div className="mt-6">
            <Link
              href="/"
              className="rounded-lg bg-[#0B1F4D] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69]"
            >
              Browse All Items
            </Link>
          </div>
        </div>
      ) : match ? (
        <div>
          <MatchConfidenceCard
            match={match}
            onMatchConfirmed={(updated) => setMatch(updated)}
            onMatchRejected={(updated) => setMatch(updated)}
          />

          {/* Verification Protocol Notice */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <div className="flex items-center space-x-2 font-semibold text-[#0B1F4D]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Campus Security Protocol</span>
            </div>
            <p className="mt-1 leading-relaxed text-slate-500">
              Confirming this match alerts the Security Office that an owner has been identified. You will be asked to verify your official Student ID before physical handover occurs.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
