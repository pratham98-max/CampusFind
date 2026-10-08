import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, date_lost, location, photo_url, org_id, reporter_id } = body;

    if (!title || !description || !category || !date_lost) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category, and date_lost are mandatory." },
        { status: 400 }
      );
    }

    const newItem = dbStore.createLostItem({
      org_id: org_id || "org-vit-pune",
      reporter_id: reporter_id || "usr-aarav-sharma",
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      date_lost,
      location: location?.trim() || "Main Campus",
      photo_url: photo_url || "",
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("[API /items/lost] Error creating lost item:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while registering lost report." },
      { status: 500 }
    );
  }
}
