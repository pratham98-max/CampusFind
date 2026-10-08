import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Attempt Supabase storage upload if configured
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabase.storage
        .from("item-photos")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("item-photos")
          .getPublicUrl(data.path);

        return NextResponse.json({ url: publicUrlData.publicUrl });
      }
    } catch (supabaseErr) {
      console.warn("[Upload] Supabase Storage upload skipped/failed, using encoded data preview fallback:", supabaseErr);
    }

    // High fidelity fallback: convert to base64 Data URL so images display natively
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("[Upload API] Error processing file upload:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
