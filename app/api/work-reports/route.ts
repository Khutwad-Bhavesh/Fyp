import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, ValidationError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const discrepancyOnly = searchParams.get("discrepancyOnly") === "true";

    const reports = dbStore.getWorkReports({ siteId, userId, discrepancyOnly });
    return NextResponse.json({ success: true, data: reports, meta: { total: reports.length } });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      siteId,
      machineId,
      quantityKg,
      machineRuntimeHrs,
      notes,
      voiceTranscript,
      activities,
      photoUrl,
      gpsLat,
      gpsLong,
    } = body;

    if (!userId || !siteId || quantityKg === undefined || machineRuntimeHrs === undefined) {
      throw new ValidationError("Missing required fields: userId, siteId, quantityKg, machineRuntimeHrs");
    }

    const report = dbStore.createWorkReport({
      userId,
      siteId,
      machineId,
      quantityKg: parseFloat(quantityKg),
      machineRuntimeHrs: parseFloat(machineRuntimeHrs),
      notes: notes || "Daily OWC waste processing",
      voiceTranscript,
      activities: activities || ["Organic Waste Feeding", "Shredding Process"],
      photoUrl,
      gpsLat: gpsLat !== undefined ? parseFloat(gpsLat) : undefined,
      gpsLong: gpsLong !== undefined ? parseFloat(gpsLong) : undefined,
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, status, reviewerId, reviewerNotes } = body;

    if (!reportId || !status || !reviewerId) {
      throw new ValidationError("Missing required review parameters: reportId, status, reviewerId");
    }

    const updated = dbStore.updateReportStatus(reportId, status, reviewerId, reviewerNotes);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}
