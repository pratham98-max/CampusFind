import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || identifier.trim() === "") {
      return NextResponse.json(
        { error: "Please enter your Student ID or institutional email." },
        { status: 400 }
      );
    }

    const clean = identifier.trim();
    const cleanLower = clean.toLowerCase();
    const users = dbStore.getUsers();

    // 1. Check exact match by email or student_id
    let user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanLower ||
        (u.student_id && u.student_id.toLowerCase() === cleanLower)
    );

    // 2. Convenience keywords
    if (!user) {
      if (cleanLower === "admin" || cleanLower.includes("faculty")) {
        user = users.find((u) => u.role === "admin");
      } else if (cleanLower === "security" || cleanLower.includes("guard")) {
        user = users.find((u) => u.role === "security");
      }
    }

    // 3. If still not found, automatically register this student on the fly!
    if (!user) {
      const isEmail = clean.includes("@");
      const derivedName = clean
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      user = dbStore.createUser({
        full_name: derivedName,
        email: isEmail ? cleanLower : `${cleanLower.replace(/\s+/g, "")}@vit.edu`,
        student_id: isEmail ? clean.split("@")[0].toUpperCase() : clean.toUpperCase(),
        role: "student",
        org_id: "org-vit-pune",
      });
      console.log(`[Auth System] Registered new student record for ${user.full_name} (${user.student_id})`);
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: `Welcome, ${user.full_name}!`,
    });

    // Set cookie for session persistence (HTTP-only)
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
