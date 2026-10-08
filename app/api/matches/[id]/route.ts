import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = dbStore.getMatchById(params.id);
    if (!match) {
      return NextResponse.json({ error: "Match record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error("[API /matches/[id]] Error retrieving match:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving match details." },
      { status: 500 }
    );
  }
}
