import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let actorId = "usr-aarav-sharma";
    try {
      const body = await request.json();
      if (body.actorId) actorId = body.actorId;
    } catch {
      // Body is optional
    }

    const updatedMatch = dbStore.confirmMatch(params.id, actorId);
    if (!updatedMatch) {
      return NextResponse.json({ error: "Match not found or already processed." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      message: "Match successfully confirmed! Both items transitioned to 'matched'.",
    });
  } catch (error) {
    console.error("[API /matches/[id]/confirm] Error confirming match:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while confirming match." },
      { status: 500 }
    );
  }
}
