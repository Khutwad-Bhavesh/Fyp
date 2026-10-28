import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, ValidationError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supervisorId = searchParams.get("supervisorId") || undefined;
    const siteId = searchParams.get("siteId") || undefined;

    const visits = dbStore.getVisits({ supervisorId, siteId });
    return NextResponse.json({ success: true, data: visits });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteId, supervisorId, scheduledDate, observations } = body;

    if (!siteId || !supervisorId || !scheduledDate) {
      throw new ValidationError("Missing required visit fields: siteId, supervisorId, scheduledDate");
    }

    const visit = dbStore.scheduleVisit({
      siteId,
      supervisorId,
      scheduledDate,
      observations,
    });

    return NextResponse.json({ success: true, data: visit }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitId, observations, checklist, evidencePhotoUrl } = body;

    if (!visitId) throw new ValidationError("Visit ID is required");

    const completed = dbStore.completeVisit(visitId, {
      observations: observations || "Inspection completed satisfactorily.",
      checklist,
      evidencePhotoUrl,
    });

    return NextResponse.json({ success: true, data: completed });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}
