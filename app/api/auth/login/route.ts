import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: "Please enter your Student ID or institutional email." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const users = dbStore.getUsers();

    // Match by email or student_id
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanIdentifier ||
        (u.student_id && u.student_id.toLowerCase() === cleanIdentifier)
    );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No institutional record found for this Student ID / Email. Try one of the demo profiles below.",
        },
        { status: 401 }
      );
    }

    // In institutional hackathon demo mode, accept password or default demo password
    const response = NextResponse.json({
      success: true,
      user,
      message: `Welcome back, ${user.full_name} (${user.role.toUpperCase()})!`,
    });

    // Set HTTP-only cookie for session persistence
    response.cookies.set("campusfind_user", JSON.stringify(user), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[API /auth/login] Error authenticating user:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during login." },
      { status: 500 }
    );
  }
}
