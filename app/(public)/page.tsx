import Link from "next/link";
import { Search, PlusCircle, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Institutional Banner */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-md bg-[#0B1F4D]/10 px-2 py-1 text-xs font-semibold text-[#0B1F4D]">
                Vishwakarma Institute of Technology
              </span>
              <span className="text-xs text-slate-500">Official Portal</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D] sm:text-3xl">
              Campus Lost & Found System
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Report lost belongings, register found items, and track claims with automated AI vector matching and verified student handover.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/report?type=lost"
              className="inline-flex items-center justify-center rounded-lg bg-[#0B1F4D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69]"
            >
              <PlusCircle className="mr-2 h-4 w-4 text-[#F5C542]" />
              Report Lost Item
            </Link>
            <Link
              href="/report?type=found"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center py-12 text-slate-500 text-sm">
        Scaffolding complete. Initializing database schema and search catalog...
      </div>
    </div>
  );
}
