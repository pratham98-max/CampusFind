import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = dbStore.getItemById(params.id);
    if (!item) {
      return NextResponse.json({ error: "Item record not found." }, { status: 404 });
    }

    const events = dbStore.getStatusEvents(params.id);
    const reporter = dbStore.getUserById(item.reporter_id);

    // Find any match associated with this item
    const allMatches = dbStore.getMatches();
    const match = allMatches.find(
      (m) => m.lost_item_id === params.id || m.found_item_id === params.id
    );

    // Find any claim associated with this match
    let claim = null;
    if (match) {
      const allClaims = dbStore.getClaims();
      claim = allClaims.find((c) => c.match_id === match.id) || null;
    }

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        reporter,
      },
      events,
      match: match || null,
      claim: claim || null,
    });
  } catch (error) {
    console.error("[API /items/[id]] Error retrieving item details:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving item." },
      { status: 500 }
    );
  }
}
