import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let adminId = "usr-admin-deshmukh";
    try {
      const body = await request.json();
      if (body.adminId) adminId = body.adminId;
    } catch {
      // Body is optional
    }

    const verifiedClaim = dbStore.verifyClaim(params.id, adminId);
    if (!verifiedClaim) {
      return NextResponse.json({ error: "Claim record not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      claim: verifiedClaim,
      message: "Student ID verified successfully! Items transitioned to 'returned'.",
    });
  } catch (error) {
    console.error("[API /claims/[id]/verify] Error verifying claim:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while verifying claim." },
      { status: 500 }
    );
  }
}
