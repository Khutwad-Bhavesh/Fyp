import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, ValidationError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const machineId = searchParams.get("machineId") || undefined;

    const telemetry = dbStore.getTelemetry(machineId);
    return NextResponse.json({ success: true, data: telemetry });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machineId, siteId, sessionRuntimeMinutes, motorCurrentAmps, powerKw, temperatureCelsius, isRunning } = body;

    if (!machineId || !siteId || sessionRuntimeMinutes === undefined) {
      throw new ValidationError("Missing required telemetry payload: machineId, siteId, sessionRuntimeMinutes");
    }

    const entry = dbStore.recordTelemetry({
      machineId,
      siteId,
      timestamp: new Date().toISOString(),
      sessionRuntimeMinutes: parseInt(sessionRuntimeMinutes, 10),
      motorCurrentAmps: motorCurrentAmps ? parseFloat(motorCurrentAmps) : 10.5,
      powerKw: powerKw ? parseFloat(powerKw) : 4.5,
      temperatureCelsius: temperatureCelsius ? parseFloat(temperatureCelsius) : 45.0,
      isRunning: isRunning !== undefined ? Boolean(isRunning) : true,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}
