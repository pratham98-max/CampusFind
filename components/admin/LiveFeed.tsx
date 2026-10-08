"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Clock,
  ArrowRight,
  User,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Package,
} from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/utils";

interface FeedEvent {
  id: string;
  item_type: "lost" | "found";
  item_id: string;
  from_status: string;
  to_status: string;
  actor_id?: string | null;
  actor_name: string;
  item_title: string;
  note: string;
  created_at: string;
}

interface LiveFeedProps {
  initialEvents: FeedEvent[];
  onStatsRefresh?: () => void;
}

export default function LiveFeed({ initialEvents = [], onStatsRefresh }: LiveFeedProps) {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLatestEvents = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.stats?.recentEvents) {
          setEvents(data.stats.recentEvents);
          setLastUpdated(new Date());
          if (onStatsRefresh) onStatsRefresh();
        }
      }
    } catch (e) {
      console.warn("Live feed poll error:", e);
    }
  };

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (!isLiveActive) return;

    // Realtime polling ticker every 4 seconds
    const interval = setInterval(fetchLatestEvents, 4000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "returned":
        return <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Returned</span>;
      case "matched":
        return <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Matched</span>;
      case "reported":
        return <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">Reported</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header with Live Indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            {isLiveActive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isLiveActive ? "bg-emerald-500" : "bg-slate-400"
              }`}
            ></span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Realtime Audit &amp; Event Stream
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Active Realtime Feed ({events.length} events)
          </span>
          <button
            type="button"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            {isLiveActive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="mt-4 divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No realtime events captured yet.
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="py-3 px-1 transition hover:bg-slate-50/70 rounded-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        evt.item_type === "lost" ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    ></span>
                    <Link
                      href={`/item/${evt.item_id}`}
                      className="text-xs font-bold text-[#0B1F4D] hover:underline"
                    >
                      {evt.item_title}
                    </Link>
                    <span className="text-[10px] text-slate-400 uppercase">
                      ({evt.item_type})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.note}
                  </p>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center">
                      <User className="mr-1 h-3 w-3 text-slate-400" />
                      {evt.actor_name}
                    </span>
                    <span>&bull;</span>
                    <span>{formatTimeAgo(evt.created_at)}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-1">
                    {getStatusBadge(evt.to_status)}
                  </div>
                  <Link
                    href={`/item/${evt.item_id}`}
                    className="text-[10px] text-slate-400 hover:text-[#0B1F4D] flex items-center"
                  >
                    <span>View</span>
                    <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
