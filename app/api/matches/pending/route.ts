import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allMatches = dbStore.getMatches();
    const pending = allMatches.filter((m) => m.status === "pending");
    return NextResponse.json(pending);
  } catch (error) {
    console.error("[API /matches/pending] Error retrieving pending matches:", error);
    return NextResponse.json({ error: "Failed to fetch pending matches" }, { status: 500 });
  }
}
