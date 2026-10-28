import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, AuthError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const user = dbStore.getUserById(userId);
      if (!user) throw new AuthError("User session not found");
      return NextResponse.json({ success: true, data: user });
    }

    // Return list of available users for role switching / demo
    const users = dbStore.getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    // Support quick role-based login
    let user;
    if (email) {
      user = dbStore.getUserByEmail(email);
    } else if (role) {
      user = dbStore.getUsers().find((u) => u.role === role);
    }

    if (!user) {
      // Default to first user of specified role or create a session
      throw new AuthError("Invalid credentials or user not found");
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        token: `mock_jwt_${user.id}_${Date.now()}`,
      },
    });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 401 });
  }
}
