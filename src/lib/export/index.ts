/**
 * Operational Report Generation & Export Utilities
 * Exports attendance, work reports, machine telemetry, and site summaries
 * Supports CSV, Spreadsheet formatting, and PDF-ready HTML.
 */

import { WorkReport, Attendance, Site } from "../../types";

export function exportWorkReportsToCsv(reports: WorkReport[]): string {
  const headers = [
    "Report ID",
    "Date",
    "Site Name",
    "Worker Name",
    "Machine Model",
    "Reported Quantity (kg)",
    "Runtime (hrs)",
    "Expected Output (kg)",
    "Discrepancy Detected",
    "Discrepancy Notes",
    "Activities",
    "Status",
    "Voice Notes Transcript",
  ];

  const rows = reports.map((r) => [
    r.id,
    r.reportDate,
    `"${(r.siteName || "").replace(/"/g, '""')}"`,
    `"${(r.userName || "").replace(/"/g, '""')}"`,
    `"${(r.machineModel || "N/A").replace(/"/g, '""')}"`,
    r.quantityKg,
    r.machineRuntimeHrs,
    r.expectedQuantityKg,
    r.discrepancyFlag ? "YES" : "NO",
    `"${(r.discrepancyNotes || "").replace(/"/g, '""')}"`,
    `"${(r.activities || []).join("; ").replace(/"/g, '""')}"`,
    r.status.toUpperCase(),
    `"${(r.voiceTranscript || r.notes || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function exportAttendanceToCsv(attendance: Attendance[]): string {
  const headers = [
    "Attendance ID",
    "Date",
    "Worker Name",
    "Site Name",
    "Check-In Time",
    "Check-Out Time",
    "GPS Latitude",
    "GPS Longitude",
    "Distance from Site (m)",
    "Within Geofence",
    "Status",
  ];

  const rows = attendance.map((a) => [
    a.id,
    a.date,
    `"${(a.userName || "").replace(/"/g, '""')}"`,
    `"${(a.siteName || "").replace(/"/g, '""')}"`,
    a.checkInTime,
    a.checkOutTime || "Active / In-progress",
    a.gpsLat,
    a.gpsLong,
    a.distanceFromSiteMeters || 0,
    a.isWithinGeofence ? "YES" : "NO",
    a.status.toUpperCase(),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function generatePrintableReportHtml(data: {
  title: string;
  companyName: string;
  generatedDate: string;
  siteName?: string;
  dateRange?: string;
  reports: WorkReport[];
  attendance: Attendance[];
}): string {
  const totalKg = data.reports.reduce((acc, r) => acc + r.quantityKg, 0);
  const totalDiscrepancies = data.reports.filter((r) => r.discrepancyFlag).length;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title} - ${data.companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; margin: 0; }
    .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; }
    .company { font-size: 22px; font-weight: bold; color: #065f46; }
    .title { font-size: 18px; color: #334155; margin-top: 5px; }
    .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
    .summary-cards { display: flex; gap: 20px; margin-bottom: 25px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; flex: 1; }
    .card-title { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .card-value { font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #065f46; color: white; text-align: left; padding: 8px 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background-color: #f8fafc; }
    .flag { color: #dc2626; font-weight: bold; }
    .verified { color: #16a34a; font-weight: bold; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">${data.companyName}</div>
    <div class="title">${data.title} ${data.siteName ? `- Site: ${data.siteName}` : ""}</div>
    <div class="meta">Generated: ${data.generatedDate} ${data.dateRange ? `| Range: ${data.dateRange}` : ""}</div>
  </div>

  <div class="summary-cards">
    <div class="card">
      <div class="card-title">Total Waste Processed</div>
      <div class="card-value">${totalKg.toLocaleString()} kg</div>
    </div>
    <div class="card">
      <div class="card-title">Total Reports Logged</div>
      <div class="card-value">${data.reports.length}</div>
    </div>
    <div class="card">
      <div class="card-title">Discrepancy Flags</div>
      <div class="card-value" style="color: ${totalDiscrepancies > 0 ? '#dc2626' : '#16a34a'}">${totalDiscrepancies}</div>
    </div>
    <div class="card">
      <div class="card-title">Attendance Check-Ins</div>
      <div class="card-value">${data.attendance.length}</div>
    </div>
  </div>

  <h3 style="margin-top: 25px; color: #065f46;">Daily Work & IoT Verification Reports</h3>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Site</th>
        <th>Worker</th>
        <th>Reported (kg)</th>
        <th>Runtime (h)</th>
        <th>Expected (kg)</th>
        <th>IoT Verification</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${data.reports
        .map(
          (r) => `
        <tr>
          <td>${r.reportDate}</td>
          <td>${r.siteName || "N/A"}</td>
          <td>${r.userName || "N/A"}</td>
          <td><strong>${r.quantityKg} kg</strong></td>
          <td>${r.machineRuntimeHrs} hrs</td>
          <td>${r.expectedQuantityKg} kg</td>
          <td>${
            r.discrepancyFlag
              ? `<span class="flag">⚠️ DISCREPANCY (+${r.discrepancyPercentage}%)</span>`
              : `<span class="verified">✓ Normal</span>`
          }</td>
          <td>${r.status.toUpperCase()}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    Smart OWC Operations Monitoring & Management System (Shuchithwam) &bull; Confidential Operational Record
  </div>
</body>
</html>
`;
}
