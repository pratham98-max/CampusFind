"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  PlusCircle,
  Filter,
  Calendar,
  Tag,
  RefreshCw,
  Sparkles,
  Inbox,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import ItemCard from "@/components/items/ItemCard";

const CATEGORIES = [
  "All",
  "Electronics",
  "Wallets & Bags",
  "Identification",
  "Books & Notebooks",
  "Bottles & Tumblers",
  "Keys",
  "Clothing & Accessories",
  "Medical Equipment",
  "Other",
];

export default function BrowsePage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | "lost" | "found">("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Error fetching items:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedType, selectedStatus, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedCategory("All");
    setSelectedType("all");
    setSelectedStatus("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    keyword !== "" ||
    selectedCategory !== "All" ||
    selectedType !== "all" ||
    selectedStatus !== "all" ||
    startDate !== "" ||
    endDate !== "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Institutional Top Bar */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded bg-[#0B1F4D]/10 px-2 py-0.5 text-xs font-semibold text-[#0B1F4D]">
                Vishwakarma Institute of Technology (VIT)
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Verified Student &amp; Staff Access
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D] sm:text-3xl">
              Campus Lost & Found Directory
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Browse actively reported belongings, filter by location or date, or initiate an AI-matched recovery claim.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/report?type=lost"
              className="inline-flex items-center justify-center rounded-lg bg-[#0B1F4D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69] transition"
            >
              <PlusCircle className="mr-2 h-4 w-4 text-[#F5C542]" />
              Report Lost Item
            </Link>
            <Link
              href="/report?type=found"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keywords, markings, color, brand, or campus location..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-[#0B1F4D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69] transition"
          >
            Search Catalog
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          {/* Type Segmented Control */}
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`rounded-md px-3 py-1.5 transition ${
                selectedType === "all" ? "bg-white text-[#0B1F4D] shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("lost")}
              className={`rounded-md px-3 py-1.5 transition ${
                selectedType === "lost" ? "bg-white text-rose-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lost Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("found")}
              className={`rounded-md px-3 py-1.5 transition ${
                selectedType === "found" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Status & Date Filter Inputs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D]"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Active (Reported)</option>
                <option value="matched">Matched</option>
                <option value="returned">Returned / Resolved</option>
              </select>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D]"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D]"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Carousel/Pills */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-[#0B1F4D] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">
          Showing <span className="text-[#0B1F4D] font-bold">{items.length}</span> items
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {selectedType !== "all" && ` (${selectedType})`}
        </p>

        <div className="text-[11px] text-slate-400">
          Sorted by: Most Recent
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse flex flex-col space-y-3"
            >
              <div className="h-40 rounded-lg bg-slate-200"></div>
              <div className="h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="h-3 w-1/2 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#0B1F4D]">No matching items found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            We couldn&apos;t find any lost or found items matching your current filters. Try searching for alternative keywords or reset your filters.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={resetFilters}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Reset All Filters
            </button>
            <Link
              href="/report?type=lost"
              className="rounded-lg bg-[#0B1F4D] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#132d69]"
            >
              Register Lost Item
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
