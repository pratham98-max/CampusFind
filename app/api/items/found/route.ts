import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, date_found, location, photo_url, org_id, reporter_id } = body;

    if (!title || !description || !category || !date_found) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category, and date_found are mandatory." },
        { status: 400 }
      );
    }

    const newItem = dbStore.createFoundItem({
      org_id: org_id || "org-vit-pune",
      reporter_id: reporter_id || "usr-security-desk",
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      date_found,
      location: location?.trim() || "Security Front Desk",
      photo_url: photo_url || "",
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("[API /items/found] Error creating found item:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while registering found report." },
      { status: 500 }
    );
  }
}
