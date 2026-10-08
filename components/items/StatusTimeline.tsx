"use client";

import { Check, Clock, ShieldCheck, PackageCheck, AlertCircle, User, ArrowRight } from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/utils";

interface StatusEvent {
  id: string;
  item_type: "lost" | "found";
  item_id: string;
  from_status: string;
  to_status: string;
  actor_id?: string | null;
  note: string;
  created_at: string;
  actor?: {
    full_name: string;
    role: string;
    student_id?: string;
  } | null;
}

interface StatusTimelineProps {
  currentStatus: "reported" | "matched" | "returned";
  hasClaim?: boolean;
  isClaimVerified?: boolean;
  events: StatusEvent[];
}

export default function StatusTimeline({
  currentStatus,
  hasClaim = false,
  isClaimVerified = false,
  events = [],
}: StatusTimelineProps) {
  // Determine active step index:
  // 0: Reported
  // 1: Matched
  // 2: Verification
  // 3: Returned
  let activeStep = 0;
  if (currentStatus === "returned") {
    activeStep = 3;
  } else if (isClaimVerified) {
    activeStep = 3;
  } else if (hasClaim) {
    activeStep = 2;
  } else if (currentStatus === "matched") {
    activeStep = 1;
  } else {
    activeStep = 0;
  }

  const steps = [
    {
      label: "Reported",
      desc: "Logged in registry",
      subtitle: "Campus report registered",
    },
    {
      label: "Matched",
      desc: "AI candidate confirmed",
      subtitle: "Ownership verified",
    },
    {
      label: "Verification",
      desc: "Student ID check",
      subtitle: "Security validation",
    },
    {
      label: "Returned",
      desc: "Physical hand-over",
      subtitle: "Resolved & closed",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0B1F4D]">Courier-Style Chain of Custody</h3>
          <p className="text-[11px] text-slate-500">Live lifecycle tracking from submission to verified return</p>
        </div>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
          Tracking ID: #{events[0]?.id?.substring(0, 12) || "LIVE-TRACE"}
        </span>
      </div>

      {/* Courier Horizontal Milestone Stepper */}
      <div className="my-8">
        <div className="relative flex items-center justify-between">
          {/* Connecting Track Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
            <div
              className="h-full bg-[#0B1F4D] transition-all duration-500"
              style={{
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Stepper Nodes */}
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-[#0B1F4D] bg-[#0B1F4D] text-white shadow-sm"
                      : isCurrent
                      ? "border-[#F5C542] bg-white text-[#0B1F4D] ring-4 ring-[#F5C542]/20 font-bold scale-110"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <div className="h-3.5 w-3.5 rounded-full bg-[#F5C542]"></div>
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <span
                    className={`block text-xs font-bold ${
                      isCurrent
                        ? "text-[#0B1F4D]"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Log */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Audit Trail &amp; Status Transitions</span>
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No status events logged yet.</p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((evt) => (
              <div key={evt.id} className="relative">
                {/* Milestone Node */}
                <span className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#0B1F4D] shadow-sm"></span>

                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>{evt.actor?.full_name || "System Automation Engine"}</span>
                      {evt.actor?.role && (
                        <span className="rounded bg-slate-200 px-1 py-0.2 text-[9px] font-medium text-slate-600 uppercase">
                          {evt.actor.role}
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400">
                      {formatDate(evt.created_at)} &bull; {formatTimeAgo(evt.created_at)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-800 leading-relaxed font-medium">
                    {evt.note}
                  </p>

                  <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {evt.from_status}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className="bg-[#0B1F4D] text-white px-1.5 py-0.5 rounded font-bold">
                      {evt.to_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
