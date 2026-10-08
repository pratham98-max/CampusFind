import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updatedMatch = dbStore.rejectMatch(params.id);
    if (!updatedMatch) {
      return NextResponse.json({ error: "Match not found or already processed." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      message: "Match rejected. Items remain open for future candidate comparisons.",
    });
  } catch (error) {
    console.error("[API /matches/[id]/reject] Error rejecting match:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while rejecting match." },
      { status: 500 }
    );
  }
}
