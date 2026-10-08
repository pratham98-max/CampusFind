import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST() {
  try {
    const data = dbStore.reset();
    return NextResponse.json({
      success: true,
      message: "Database successfully reset to initial seed state.",
      data,
    });
  } catch (error) {
    console.error("[API /admin/reset] Error resetting database:", error);
    return NextResponse.json(
      { error: "Failed to reset demo database." },
      { status: 500 }
    );
  }
}
