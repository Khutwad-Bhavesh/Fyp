import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { formatErrorResponse, ValidationError } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("id");

    if (siteId) {
      const site = dbStore.getSiteById(siteId);
      if (!site) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Site not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: site });
    }

    const sites = dbStore.getSites();
    return NextResponse.json({ success: true, data: sites, meta: { total: sites.length, timestamp: new Date().toISOString() } });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, latitude, longitude, supervisorId } = body;

    if (!name || !location || latitude === undefined || longitude === undefined || !supervisorId) {
      throw new ValidationError("Missing required fields: name, location, latitude, longitude, supervisorId");
    }

    const newSite = dbStore.createSite({
      name,
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      supervisorId,
      status: "active",
      monthlyVisitStatus: "scheduled",
    });

    return NextResponse.json({ success: true, data: newSite }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) throw new ValidationError("Site ID is required for updates");

    const updated = dbStore.updateSite(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 400 });
  }
}
