"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import StatusTimeline from "@/components/items/StatusTimeline";
import ClaimForm from "@/components/items/ClaimForm";
import { formatDate } from "@/lib/utils";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [match, setMatch] = useState<any | null>(null);
  const [claim, setClaim] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItem = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/items/${itemId}`);
      if (!res.ok) {
        throw new Error("Item record not found in campus database.");
      }
      const data = await res.json();
      setItem(data.item);
      setEvents(data.events || []);
      setMatch(data.match || null);
      setClaim(data.claim || null);
    } catch (err: any) {
      setError(err.message || "Failed to load item.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-1/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
          <div className="h-64 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-4 text-base font-bold text-rose-900">Item Not Found</h2>
          <p className="mt-1 text-xs text-rose-700">{error || "Item does not exist."}</p>
          <div className="mt-6">
            <Link
              href="/"
              className="rounded-lg bg-[#0B1F4D] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69]"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLost = item.item_type === "lost";
  const itemDate = item.date_lost || item.date_found;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#0B1F4D] transition"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Directory
        </Link>
        <div className="flex items-center space-x-2">
          <span
            className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              isLost
                ? "bg-rose-100 text-rose-800 border border-rose-200"
                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}
          >
            {isLost ? "Lost Report" : "Found Item"}
          </span>
          <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Item Overview & Media (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* Image */}
            <div className="relative aspect-[4/3] w-full bg-slate-100 border-b border-slate-200">
              {item.photo_url ? (
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                  No photo attached to this report
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <h1 className="text-xl font-bold text-[#0B1F4D]">{item.title}</h1>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                  <Tag className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                  {item.category}
                </span>
                <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                  {isLost ? "Lost on" : "Found on"} {formatDate(itemDate)}
                </span>
                <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                  {item.location || "Campus Grounds"}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Item Description
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {item.description}
                </p>
              </div>

              {/* Reporter Info */}
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Registered by:</span>
                  <span className="font-semibold text-slate-800">
                    {item.reporter?.full_name || "Campus Community Member"}
                  </span>
                </div>
                {item.reporter?.student_id && (
                  <div className="mt-1 flex items-center justify-between">
                    <span>Student / Staff ID:</span>
                    <span className="font-mono text-slate-700">{item.reporter.student_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Match Notice Banner if candidate exists */}
          {match && match.status === "pending" && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Candidate AI Match Detected ({Math.round(match.confidence_score * 100)}%)
                  </h4>
                  <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                    Our semantic matching engine detected a high-confidence pairing with a registered item.
                  </p>
                  <Link
                    href={`/match/${match.id}`}
                    className="mt-3 inline-flex items-center space-x-1.5 rounded-lg bg-[#0B1F4D] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#132d69]"
                  >
                    <span>Inspect Side-by-Side Diff &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Timeline & Claim Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Timeline */}
          <StatusTimeline
            currentStatus={item.status}
            hasClaim={!!claim}
            isClaimVerified={claim?.verified || false}
            events={events}
          />

          {/* Claim Verification Card (visible if match is confirmed or pending claim) */}
          {match && match.status === "confirmed" && (
            <ClaimForm
              matchId={match.id}
              itemId={item.id}
              itemTitle={item.title}
              existingClaim={claim}
              onClaimUpdated={() => {
                loadItem();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
