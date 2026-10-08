"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  MapPin,
  Calendar,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/lib/auth/context";

interface ItemFormProps {
  initialType?: "lost" | "found";
}

const CATEGORIES = [
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

export default function ItemForm({ initialType = "lost" }: ItemFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const defaultTab = (searchParams.get("type") as "lost" | "found") || initialType;

  const [itemType, setItemType] = useState<"lost" | "found">(defaultTab);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedItem, setSubmittedItem] = useState<any | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrors((prev) => ({ ...prev, photo: "" }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        photo: "Failed to upload image. Please try a smaller JPEG or PNG image.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = "Provide an item name (e.g. 'Casio Calculator' or 'Hydro Flask') so students can identify it.";
    } else if (title.trim().length < 3) {
      errs.title = "Item name is too brief. Include brand or primary attribute.";
    }

    if (!description.trim()) {
      errs.description =
        "Add distinctive markings, color, condition, or stickers so the AI matcher can calculate high-confidence pairs.";
    } else if (description.trim().length < 10) {
      errs.description =
        "Description is too short. Describe color, scratches, or unique details (at least 10 characters).";
    }

    if (!category) {
      errs.category = "Select a category to enable accurate institutional sorting.";
    }

    if (!date) {
      errs.date = "Please specify the date this item was lost or discovered.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const endpoint = itemType === "lost" ? "/api/items/lost" : "/api/items/found";
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        [itemType === "lost" ? "date_lost" : "date_found"]: date,
        location: location.trim() || (itemType === "lost" ? "Campus Grounds" : "Security Front Desk"),
        photo_url: photoUrl,
        org_id: user?.org_id || "org-vit-pune",
        reporter_id: user?.id || (itemType === "lost" ? "usr-aarav-sharma" : "usr-security-desk"),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit report");
      }

      const result = await res.json();
      setSubmittedItem(result.item);

      // If matches were returned by found endpoint
      if (result.matches && result.matches.length > 0) {
        // Will be utilized in Milestone 4 & 5
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || "An unexpected error occurred while saving the report.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedItem) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="mt-4 inline-block rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            {itemType === "lost" ? "Lost Report Registered" : "Found Item Logged"}
          </span>
          <h2 className="mt-2 text-xl font-bold text-[#0B1F4D]">{submittedItem.title}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {itemType === "lost"
              ? "Your report is now live in the institutional registry. Our AI matching engine will monitor all incoming found reports and notify you immediately."
              : "Thank you for handing over or registering this found item. The AI matching engine has evaluated candidate lost reports across campus."}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/item/${submittedItem.id}`)}
              className="rounded-lg bg-[#0B1F4D] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69]"
            >
              View Status Timeline &rarr;
            </button>
            <button
              onClick={() => {
                setSubmittedItem(null);
                setTitle("");
                setDescription("");
                setLocation("");
                setPhotoUrl("");
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => {
            setItemType("lost");
            setErrors({});
          }}
          className={`flex-1 py-4 text-center text-sm font-semibold transition-all border-b-2 ${
            itemType === "lost"
              ? "border-[#0B1F4D] bg-white text-[#0B1F4D] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>I Lost Something</span>
          </div>
          <p className="text-[11px] font-normal text-slate-400 mt-0.5">Submit details to be notified of matches</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setItemType("found");
            setErrors({});
          }}
          className={`flex-1 py-4 text-center text-sm font-semibold transition-all border-b-2 ${
            itemType === "found"
              ? "border-[#0B1F4D] bg-white text-[#0B1F4D] shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>I Found Something</span>
          </div>
          <p className="text-[11px] font-normal text-slate-400 mt-0.5">Register an item to reunite with owner</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {errors.form && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Item Name / Title <span className="text-rose-500">*</span>
          </label>
          <div className="mt-1.5 relative">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder={
                itemType === "lost"
                  ? "e.g., Stainless Steel Hydro Flask (32oz)"
                  : "e.g., Grey Water Bottle found in reading hall"
              }
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-[#0B1F4D] focus:ring-[#0B1F4D]/10"
              }`}
            />
          </div>
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1">
              <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1.5 relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Matches are strictly gated within the same institutional category.
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              {itemType === "lost" ? "Date Lost" : "Date Found"} <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1.5 relative">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
                }}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    : "border-slate-300 focus:border-[#0B1F4D] focus:ring-[#0B1F4D]/10"
                }`}
              />
            </div>
            {errors.date && <p className="mt-1.5 text-xs text-rose-600">{errors.date}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Campus Location (Optional)
          </label>
          <div className="mt-1.5 relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Central Library 2nd Floor, CS Lab 402, North Cafeteria Benches"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Pinpointing the campus zone helps security personnel match physical drop-off logs.
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Powers pgvector AI matching</span>
          </div>
          <div className="mt-1.5">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder={
                itemType === "lost"
                  ? "Describe physical characteristics, distinctive marks, engravings, stickers, scratches, case color, or contents..."
                  : "Describe condition, appearance, stickers, color, and where it was left..."
              }
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-[#0B1F4D] focus:ring-[#0B1F4D]/10"
              }`}
            />
          </div>
          {errors.description ? (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1">
              <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
              {errors.description}
            </p>
          ) : (
            <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-500">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Semantic AI matches descriptions even if worded differently (e.g. &apos;blue bottle&apos; vs &apos;hydro flask&apos;).</span>
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Photo Verification (Optional)
          </label>
          <div className="mt-2">
            {photoUrl ? (
              <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={photoUrl}
                  alt="Uploaded preview"
                  className="h-44 w-auto object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-white hover:bg-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center cursor-pointer hover:bg-slate-100/60 transition-colors">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0B1F4D]" />
                    <span className="mt-2 text-xs font-medium text-slate-600">Uploading photo to storage...</span>
                  </div>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-slate-400" />
                    <span className="mt-2 text-xs font-semibold text-slate-700">Click to upload photo</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG or WebP up to 5MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
            {errors.photo && <p className="mt-1.5 text-xs text-rose-600">{errors.photo}</p>}
          </div>
        </div>

        {/* Form Action */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {itemType === "lost" ? "Report will be visible to campus students and security" : "Item will be indexed for instant AI match evaluation"}
          </p>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center space-x-2 rounded-lg bg-[#0B1F4D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69] disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#F5C542]" />
                <span>Submitting Report...</span>
              </>
            ) : (
              <>
                <span>{itemType === "lost" ? "Submit Lost Report" : "Register Found Item"}</span>
                <span className="text-[#F5C542]">&rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
