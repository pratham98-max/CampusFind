"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MatchConfidenceCardProps {
  match: {
    id: string;
    confidence_score: number;
    category_match: boolean;
    keyword_score: number;
    date_score: number;
    embedding_score: number;
    status: "pending" | "confirmed" | "rejected";
    created_at: string;
    confirmed_at?: string | null;
    lost_item?: any;
    found_item?: any;
  };
  onMatchConfirmed?: (updatedMatch: any) => void;
  onMatchRejected?: (updatedMatch: any) => void;
}

export default function MatchConfidenceCard({
  match,
  onMatchConfirmed,
  onMatchRejected,
}: MatchConfidenceCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(match.status);
  const [actionError, setActionError] = useState("");

  const lost = match.lost_item;
  const found = match.found_item;

  const handleConfirm = async () => {
    setIsProcessing(true);
    setActionError("");
    try {
      const res = await fetch(`/api/matches/${match.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: lost?.reporter_id }),
      });

      if (!res.ok) throw new Error("Failed to confirm match");
      const data = await res.json();
      setCurrentStatus("confirmed");
      if (onMatchConfirmed) onMatchConfirmed(data.match);
    } catch (e: any) {
      setActionError(e.message || "Failed to confirm match.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setActionError("");
    try {
      const res = await fetch(`/api/matches/${match.id}/reject`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to reject match");
      const data = await res.json();
      setCurrentStatus("rejected");
      if (onMatchRejected) onMatchRejected(data.match);
    } catch (e: any) {
      setActionError(e.message || "Failed to reject match.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confidencePct = Math.round(match.confidence_score * 100);
  const embeddingPct = Math.round(match.embedding_score * 100);
  const datePct = Math.round(match.date_score * 100);
  const keywordPct = Math.round(match.keyword_score * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header Confidence Score Banner */}
      <div className="bg-[#0B1F4D] px-6 py-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#F5C542] px-2 py-0.5 text-xs font-bold text-[#0B1F4D]">
                AI MATCH EVALUATION
              </span>
              <span className="text-xs text-slate-300">Match ID: {match.id}</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white flex items-center space-x-3">
              <span>Candidate Match Found</span>
              <span className="text-3xl font-extrabold text-[#F5C542]">{confidencePct}%</span>
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Evaluated via multi-factor hybrid scoring: 60% semantic vector embedding + 40% date proximity decay.
            </p>
          </div>

          <div className="flex items-center">
            {currentStatus === "confirmed" ? (
              <span className="inline-flex items-center rounded-lg bg-emerald-500/20 px-3.5 py-1.5 text-sm font-semibold text-emerald-300 border border-emerald-500/40">
                <CheckCircle className="mr-1.5 h-4 w-4" /> Match Confirmed
              </span>
            ) : currentStatus === "rejected" ? (
              <span className="inline-flex items-center rounded-lg bg-rose-500/20 px-3.5 py-1.5 text-sm font-semibold text-rose-300 border border-rose-500/40">
                <XCircle className="mr-1.5 h-4 w-4" /> Match Rejected
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg bg-amber-500/20 px-3.5 py-1.5 text-sm font-semibold text-amber-300 border border-amber-500/40">
                Pending Review
              </span>
            )}
          </div>
        </div>

        {/* Detailed Metric Gauges */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-700/60 pt-4 text-xs">
          {/* Category Hard Gate */}
          <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
            <span className="text-slate-400 font-medium block">Category Gate</span>
            <div className="mt-1 flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle className="h-4 w-4" />
              <span>100% (Passed)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block truncate">
              {lost?.category || "Matches"}
            </span>
          </div>

          {/* Embedding Similarity */}
          <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Embedding Vector</span>
              <span className="text-[#F5C542] font-bold">{embeddingPct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#F5C542]" style={{ width: `${embeddingPct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">pgvector 384-dim cosine</span>
          </div>

          {/* Date Proximity */}
          <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Date Proximity</span>
              <span className="text-blue-300 font-bold">{datePct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400" style={{ width: `${datePct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Decay: 1 - (&Delta;days / 30)</span>
          </div>

          {/* Keyword Overlap */}
          <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Token Overlap</span>
              <span className="text-slate-200 font-bold">{keywordPct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400" style={{ width: `${keywordPct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Token Jaccard overlap</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Side-by-Side Diff Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/50">
        {/* Left Side: Reported Lost Item */}
        <div className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Your Lost Report
              </h3>
            </div>
            <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
              Lost Item
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {lost?.photo_url && (
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                <img
                  src={lost.photo_url}
                  alt={lost.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-[#0B1F4D]">{lost?.title || "Lost Item"}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center rounded bg-white px-2 py-1 border border-slate-200">
                  <Tag className="mr-1 h-3 w-3 text-slate-400" />
                  {lost?.category}
                </span>
                <span className="inline-flex items-center rounded bg-white px-2 py-1 border border-slate-200">
                  <Calendar className="mr-1 h-3 w-3 text-slate-400" />
                  Lost on {formatDate(lost?.date_lost)}
                </span>
                <span className="inline-flex items-center rounded bg-white px-2 py-1 border border-slate-200">
                  <MapPin className="mr-1 h-3 w-3 text-slate-400" />
                  {lost?.location || "Campus Grounds"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Submitted Description:
              </span>
              <p className="mt-1 rounded-lg bg-white p-3 text-xs leading-relaxed text-slate-800 border border-slate-200">
                {lost?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Recovered Found Item */}
        <div className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recovered Found Item
              </h3>
            </div>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
              Found on Campus
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {found?.photo_url && (
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                <img
                  src={found.photo_url}
                  alt={found.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-[#0B1F4D]">{found?.title || "Found Item"}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center rounded bg-white px-2 py-1 border border-slate-200">
                  <Tag className="mr-1 h-3 w-3 text-slate-400" />
                  {found?.category}
                </span>
                <span className="inline-flex items-center rounded bg-white px-2 py-1 border border-slate-200">
                  <Calendar className="mr-1 h-3 w-3 text-slate-400" />
                  Found on {formatDate(found?.date_found)}
                </span>
                <span className="inline-flex items-center rounded bg-white px-2 py-1 border border-slate-200">
                  <MapPin className="mr-1 h-3 w-3 text-slate-400" />
                  {found?.location || "Security Front Desk"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Finder / Security Description:
              </span>
              <p className="mt-1 rounded-lg bg-white p-3 text-xs leading-relaxed text-slate-800 border border-slate-200">
                {found?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Actions or Next Step */}
      <div className="p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {currentStatus === "confirmed" ? (
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-emerald-700 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" /> Match Confirmed by Owner!
              </span>
              <p className="text-slate-500 mt-0.5">
                Next Step: Submit your Student ID to verify ownership and complete pickup.
              </p>
            </div>
          ) : currentStatus === "rejected" ? (
            <div className="text-xs text-slate-500">
              Match marked as rejected. This candidate pairing is dismissed.
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Please inspect the descriptions carefully before confirming ownership.
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {currentStatus === "pending" ? (
            <>
              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Not My Item"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 rounded-lg bg-[#0B1F4D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#F5C542]" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-[#F5C542]" />
                    <span>Confirm Match — This is Mine</span>
                  </>
                )}
              </button>
            </>
          ) : currentStatus === "confirmed" ? (
            <Link
              href={`/item/${lost?.id}`}
              className="flex items-center space-x-2 rounded-lg bg-[#0B1F4D] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#132d69] shadow-sm"
            >
              <FileCheck className="h-4 w-4 text-[#F5C542]" />
              <span>Proceed to Student ID Claim &rarr;</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Return to Catalog
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
