import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, ValidationError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    const machines = siteId ? dbStore.getMachinesBySite(siteId) : dbStore.getMachines();
    return NextResponse.json({ success: true, data: machines });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteId, model, serialNumber, ratedCapacityKgHr } = body;

    if (!siteId || !model || !serialNumber || !ratedCapacityKgHr) {
      throw new ValidationError("Missing required machine fields: siteId, model, serialNumber, ratedCapacityKgHr");
    }

    const machine = dbStore.createMachine({
      siteId,
      model,
      serialNumber,
      ratedCapacityKgHr: parseFloat(ratedCapacityKgHr),
      currentStatus: "operational",
    });

    return NextResponse.json({ success: true, data: machine }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}
