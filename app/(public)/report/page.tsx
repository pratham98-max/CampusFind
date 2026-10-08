import { Suspense } from "react";
import ItemForm from "@/components/items/ItemForm";
import { ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Report Lost or Found Item | CampusFind",
  description: "Register a lost belonging or submit a found campus item to initiate AI matching.",
};

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-[#0B1F4D]/10 px-2 py-0.5 text-xs font-semibold text-[#0B1F4D]">
            Official Registry
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500">Fast 2-Minute Submission</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D] sm:text-3xl">
          Report Campus Item
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Whether you misplaced an item or found someone else&apos;s belonging, register details here for instant algorithmic pairing and verified recovery.
        </p>
      </div>

      {/* Main Form Wrapped in Suspense */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            Loading submission form...
          </div>
        }
      >
        <ItemForm />
      </Suspense>

      {/* Institutional Guidance Note */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0B1F4D]">
            <Sparkles className="h-4 w-4 text-[#F5C542]" />
            <span>AI Semantic Matching</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Our system compares high-dimensional semantic embeddings, so slight phrasing differences will still trigger a match.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0B1F4D]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>ID Claim Verification</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Belongings are never handed over without mandatory Student ID or staff registration number verification.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0B1F4D]">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span>Security Drop-Off</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Items found on campus can be dropped off at the 24/7 Main Security Desk or Department Offices.
          </p>
        </div>
      </div>
    </div>
  );
}
