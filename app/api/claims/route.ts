import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const claims = dbStore.getClaims();
    return NextResponse.json({ success: true, count: claims.length, claims });
  } catch (error) {
    console.error("[API /claims] Error retrieving claims:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving claims." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, student_id_input, claimant_id } = body;

    if (!match_id || !student_id_input) {
      return NextResponse.json(
        { error: "Missing required fields: match_id and student_id_input are mandatory." },
        { status: 400 }
      );
    }

    const claim = dbStore.createClaim(match_id, student_id_input, claimant_id);

    return NextResponse.json(
      {
        success: true,
        claim,
        message: "Ownership verification claim submitted. Awaiting security desk validation.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /claims] Error creating claim:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit verification claim." },
      { status: 500 }
    );
  }
}
