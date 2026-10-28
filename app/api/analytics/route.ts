import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const analytics = dbStore.getSystemAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
