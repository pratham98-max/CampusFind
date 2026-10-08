import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const keyword = searchParams.get("keyword") || undefined;
    const status = searchParams.get("status") || undefined;
    const type = (searchParams.get("type") as "all" | "lost" | "found") || "all";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const items = dbStore.getAllItems({
      category,
      keyword,
      status,
      type,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error("[API /items] Error querying items:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving catalog items." },
      { status: 500 }
    );
  }
}
