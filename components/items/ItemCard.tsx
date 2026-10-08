import Link from "next/link";
import { MapPin, Calendar, Image as ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ItemCardProps {
  item: {
    id: string;
    item_type: "lost" | "found";
    title: string;
    description: string;
    category: string;
    date_lost?: string;
    date_found?: string;
    location?: string;
    photo_url?: string;
    status: "reported" | "matched" | "returned";
    created_at: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const isLost = item.item_type === "lost";
  const itemDate = item.date_lost || item.date_found;

  const statusBadge = () => {
    switch (item.status) {
      case "matched":
        return <span className="rounded-md bg-blue-100/90 px-2 py-0.5 text-[11px] font-semibold text-blue-800 shadow-sm">Matched</span>;
      case "returned":
        return <span className="rounded-md bg-emerald-100/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-sm">Returned</span>;
      case "reported":
      default:
        return <span className="rounded-md bg-amber-100/90 px-2 py-0.5 text-[11px] font-semibold text-amber-800 shadow-sm">Active Report</span>;
    }
  };

  return (
    <Link
      href={`/item/${item.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md overflow-hidden"
    >
      {/* Photo Container - Airbnb Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-400">
            <ImageIcon className="h-10 w-10 stroke-1 text-slate-300" />
            <span className="mt-1 text-[11px] font-medium text-slate-400">No photo uploaded</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm ${
              isLost
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {isLost ? "Lost" : "Found"}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          {statusBadge()}
        </div>
      </div>

      {/* Card Content - Dense, functional metadata */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category Pill */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600 uppercase tracking-wider">{item.category}</span>
          <span className="flex items-center text-slate-400">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(itemDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-1.5 text-base font-bold text-[#0B1F4D] line-clamp-1 group-hover:text-blue-900">
          {item.title}
        </h3>

        {/* Description Snippet */}
        <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Location Pin */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center truncate text-[11px]">
            <MapPin className="mr-1 h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location || "Campus Grounds"}</span>
          </span>
          <span className="text-[11px] font-semibold text-[#0B1F4D] group-hover:underline shrink-0 ml-2">
            Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
