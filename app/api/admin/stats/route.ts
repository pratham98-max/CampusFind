import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = dbStore.getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("[API /admin/stats] Error retrieving admin metrics:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving dashboard statistics." },
      { status: 500 }
    );
  }
}
