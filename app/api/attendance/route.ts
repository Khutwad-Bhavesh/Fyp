import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, ValidationError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const date = searchParams.get("date") || undefined;

    const list = dbStore.getAttendance({ siteId, userId, date });
    return NextResponse.json({ success: true, data: list, meta: { total: list.length } });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, siteId, photoUrl, gpsLat, gpsLong, gpsAccuracyMeters } = body;

    if (!userId || !siteId || !photoUrl || gpsLat === undefined || gpsLong === undefined) {
      throw new ValidationError("Missing required attendance parameters: userId, siteId, photoUrl, gpsLat, gpsLong");
    }

    const attendance = dbStore.recordCheckIn({
      userId,
      siteId,
      photoUrl,
      gpsLat: parseFloat(gpsLat),
      gpsLong: parseFloat(gpsLong),
      gpsAccuracyMeters: gpsAccuracyMeters ? parseFloat(gpsAccuracyMeters) : 10,
    });

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { attendanceId } = body;

    if (!attendanceId) throw new ValidationError("Attendance ID is required for check-out");

    const updated = dbStore.recordCheckOut(attendanceId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}
