import { NextRequest, NextResponse } from "next/server";
import dbStore from "@/src/lib/db/store";
import { exportWorkReportsToCsv, exportAttendanceToCsv, generatePrintableReportHtml } from "@/src/lib/export";
import { formatErrorResponse } from "@/src/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv"; // 'csv' or 'html'
    const type = searchParams.get("type") || "reports"; // 'reports' or 'attendance'
    const siteId = searchParams.get("siteId") || undefined;

    const reports = dbStore.getWorkReports({ siteId });
    const attendance = dbStore.getAttendance({ siteId });
    const site = siteId ? dbStore.getSiteById(siteId) : undefined;

    if (format === "html") {
      const html = generatePrintableReportHtml({
        title: "OWC Operational Performance & Monitoring Report",
        companyName: "Rajeshree Enviro Solutions",
        generatedDate: new Date().toLocaleString(),
        siteName: site?.name,
        reports,
        attendance,
      });

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Default CSV
    const csvContent = type === "attendance" ? exportAttendanceToCsv(attendance) : exportWorkReportsToCsv(reports);
    const filename = `owc_${type}_report_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
