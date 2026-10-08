import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("campusfind_user");
    if (!userCookie || !userCookie.value) {
      return NextResponse.json({ user: null });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
