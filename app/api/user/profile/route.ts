import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("campusfind_user");
    if (!userCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = JSON.parse(userCookie.value);
    const user = dbStore.getUserById(sessionUser.id) || sessionUser;

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[API /user/profile GET] Error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("campusfind_user");
    if (!userCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = JSON.parse(userCookie.value);
    const body = await request.json();

    const {
      full_name,
      prn,
      roll_no,
      department,
      academic_year,
      division,
      phone,
      address,
      emergency_contact,
      blood_group,
    } = body;

    const updatedUser = dbStore.updateUserProfile(sessionUser.id, {
      full_name: full_name?.trim() || sessionUser.full_name,
      prn: prn?.trim(),
      roll_no: roll_no?.trim(),
      department: department?.trim(),
      academic_year: academic_year?.trim(),
      division: division?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      emergency_contact: emergency_contact?.trim(),
      blood_group: blood_group?.trim(),
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    // Refresh session cookie with updated user data
    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Institutional profile updated successfully!",
    });

    response.cookies.set("campusfind_user", JSON.stringify(updatedUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[API /user/profile PUT] Error:", error);
    return NextResponse.json(
      { error: "Failed to save profile changes" },
      { status: 500 }
    );
  }
}
