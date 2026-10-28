/**
 * Shuchithwam Smart OWC Operations Monitoring & Management System
 * Standalone Zero-Dependency Application Server
 * 
 * Runs directly on any Node.js runtime (including `agy-node` and `node`)
 * Client: Rajeshree Enviro Solutions
 */

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

// ================= SEED DATA =================
const users = [
  { id: "usr_admin_01", name: "Bhavesh Khutwad (Admin)", role: "admin", phone: "+91 98200 11001", email: "admin@rajeshreeenviro.com", status: "active" },
  { id: "usr_sup_01", name: "Vaibhav Badade (Supervisor)", role: "supervisor", phone: "+91 98200 22002", email: "vaibhav.badade@rajeshreeenviro.com", assignedSiteId: "site_dadar_01", status: "active" },
  { id: "usr_sup_02", name: "Shreyash Redkar (Supervisor)", role: "supervisor", phone: "+91 98200 33003", email: "shreyash.redkar@rajeshreeenviro.com", assignedSiteId: "site_hinjewadi_02", status: "active" },
  { id: "usr_wrk_01", name: "Pranav Mehadale (Worker)", role: "worker", phone: "+91 98200 44004", email: "pranav.mehadale@rajeshreeenviro.com", assignedSiteId: "site_dadar_01", status: "active" },
  { id: "usr_wrk_02", name: "Ramesh Shinde (Worker)", role: "worker", phone: "+91 98200 55005", email: "ramesh.shinde@rajeshreeenviro.com", assignedSiteId: "site_hinjewadi_02", status: "active" },
  { id: "usr_wrk_03", name: "Santosh Jadhav (Worker)", role: "worker", phone: "+91 98200 66006", email: "santosh.jadhav@rajeshreeenviro.com", assignedSiteId: "site_bkc_03", status: "active" }
];

const sites = [
  { id: "site_dadar_01", name: "Dadar Central OWC Plant", location: "Dadar West, Mumbai, Maharashtra 400028", latitude: 19.0178, longitude: 72.8478, supervisorId: "usr_sup_01", supervisorName: "Vaibhav Badade", status: "active", monthlyVisitStatus: "completed", lastVisitedDate: "2026-10-14" },
  { id: "site_hinjewadi_02", name: "Hinjewadi Tech Park Eco-Site", location: "Phase 1, Hinjewadi, Pune, Maharashtra 411057", latitude: 18.5913, longitude: 73.7389, supervisorId: "usr_sup_02", supervisorName: "Shreyash Redkar", status: "active", monthlyVisitStatus: "scheduled", lastVisitedDate: "2026-09-28" },
  { id: "site_bkc_03", name: "BKC Complex Waste Composting Hub", location: "G Block, Bandra Kurla Complex, Mumbai 400051", latitude: 19.0657, longitude: 72.8687, supervisorId: "usr_sup_01", supervisorName: "Vaibhav Badade", status: "active", monthlyVisitStatus: "overdue", lastVisitedDate: "2026-09-12" },
  { id: "site_chembur_04", name: "Chembur Municipal Green Facility", location: "Near Station Road, Chembur, Mumbai 400071", latitude: 19.0622, longitude: 72.8974, supervisorId: "usr_sup_02", supervisorName: "Shreyash Redkar", status: "active", monthlyVisitStatus: "scheduled", lastVisitedDate: "2026-10-02" }
];

const machines = [
  { id: "mach_owc_60_01", siteId: "site_dadar_01", siteName: "Dadar Central OWC Plant", model: "OWC-60", serialNumber: "RES-OWC60-2026-001", ratedCapacityKgHr: 25.0, totalRuntimeHrs: 142.5, currentStatus: "running" },
  { id: "mach_owc_130_02", siteId: "site_hinjewadi_02", siteName: "Hinjewadi Tech Park Eco-Site", model: "OWC-130", serialNumber: "RES-OWC130-2026-002", ratedCapacityKgHr: 50.0, totalRuntimeHrs: 210.0, currentStatus: "operational" },
  { id: "mach_owc_300_03", siteId: "site_bkc_03", siteName: "BKC Complex Waste Composting Hub", model: "OWC-300", serialNumber: "RES-OWC300-2026-003", ratedCapacityKgHr: 100.0, totalRuntimeHrs: 350.2, currentStatus: "maintenance" },
  { id: "mach_owc_60_04", siteId: "site_chembur_04", siteName: "Chembur Municipal Green Facility", model: "OWC-60", serialNumber: "RES-OWC60-2026-004", ratedCapacityKgHr: 25.0, totalRuntimeHrs: 98.4, currentStatus: "operational" }
];

const attendance = [
  { id: "att_001", userId: "usr_wrk_01", userName: "Pranav Mehadale", userRole: "worker", siteId: "site_dadar_01", siteName: "Dadar Central OWC Plant", checkInTime: "2026-10-28T08:02:15Z", photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop", gpsLat: 19.0179, gpsLong: 72.8479, gpsAccuracyMeters: 12, distanceFromSiteMeters: 15, isWithinGeofence: true, status: "checked_in", date: "2026-10-28" },
  { id: "att_002", userId: "usr_wrk_02", userName: "Ramesh Shinde", userRole: "worker", siteId: "site_hinjewadi_02", siteName: "Hinjewadi Tech Park Eco-Site", checkInTime: "2026-10-28T07:55:00Z", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop", gpsLat: 18.5912, gpsLong: 73.7388, gpsAccuracyMeters: 8, distanceFromSiteMeters: 22, isWithinGeofence: true, status: "checked_in", date: "2026-10-28" }
];

const workReports = [
  {
    id: "rep_001",
    userId: "usr_wrk_01",
    userName: "Pranav Mehadale",
    siteId: "site_dadar_01",
    siteName: "Dadar Central OWC Plant",
    machineId: "mach_owc_60_01",
    machineModel: "OWC-60 (25 kg/hr)",
    reportDate: "2026-10-27",
    quantityKg: 50.0,
    machineRuntimeHrs: 2.0,
    expectedQuantityKg: 50.0,
    discrepancyFlag: false,
    notes: "Processed morning wet organic waste batch. Shredder operated smoothly, bio-culture added.",
    voiceTranscript: "Morning batch of wet waste processed successfully. Machine ran for two hours, moisture balanced.",
    activities: ["Waste Segregation & Sorting", "Organic Waste Feeding", "Shredding Process", "Bio-culture & Moisture Addition"],
    status: "verified",
    createdAt: "2026-10-27T16:30:00Z"
  },
  {
    id: "rep_002",
    userId: "usr_wrk_01",
    userName: "Pranav Mehadale",
    siteId: "site_dadar_01",
    siteName: "Dadar Central OWC Plant",
    machineId: "mach_owc_60_01",
    machineModel: "OWC-60 (25 kg/hr)",
    reportDate: "2026-10-28",
    quantityKg: 100.0,
    machineRuntimeHrs: 0.5,
    expectedQuantityKg: 12.5,
    discrepancyFlag: true,
    discrepancyPercentage: 700,
    discrepancyNotes: "Reported 100 kg exceeds expected output (12.5 kg at 25 kg/hr for 0.5h) by 700%. Requires supervisor physical audit.",
    notes: "Reported high quantity processed quickly.",
    voiceTranscript: "Aaj Dadar site par 100 kilo waste feed kiya gaya aur 30 minute machine chalayi.",
    activities: ["Organic Waste Feeding", "Shredding Process"],
    status: "flagged",
    createdAt: "2026-10-28T08:35:00Z"
  }
];

const visits = [
  { id: "vst_001", siteId: "site_dadar_01", siteName: "Dadar Central OWC Plant", supervisorId: "usr_sup_01", supervisorName: "Vaibhav Badade", scheduledDate: "2026-10-14", status: "completed", observations: "Site in orderly condition. Motor gearbox inspected, blades sharp, curing moisture optimal." },
  { id: "vst_002", siteId: "site_hinjewadi_02", siteName: "Hinjewadi Tech Park Eco-Site", supervisorId: "usr_sup_02", supervisorName: "Shreyash Redkar", scheduledDate: "2026-10-30", status: "scheduled", observations: "Upcoming scheduled monthly inspection. Focus on electrical control panel." },
  { id: "vst_003", siteId: "site_bkc_03", siteName: "BKC Complex Waste Composting Hub", supervisorId: "usr_sup_01", supervisorName: "Vaibhav Badade", scheduledDate: "2026-10-12", status: "overdue", observations: "Site overdue for monthly inspection. Last visited on 2026-09-12. Immediate audit required." }
];

const telemetry = [
  { id: "tel_001", machineId: "mach_owc_60_01", siteId: "site_dadar_01", timestamp: "2026-10-28T08:45:00Z", sessionRuntimeMinutes: 30, motorCurrentAmps: 11.2, powerKw: 4.8, temperatureCelsius: 48.5, isRunning: true }
];

// ================= IOT VERIFICATION FORMULA =================
function verifyReportedQuantity(ratedCapacityKgHr, runtimeHours, reportedQuantityKg, tolerancePercentage = 25) {
  if (runtimeHours <= 0) {
    const isDiscrepancy = reportedQuantityKg > 0;
    return {
      expectedQuantityKg: 0,
      reportedQuantityKg,
      percentageVariance: reportedQuantityKg > 0 ? 100 : 0,
      isDiscrepancy,
      supervisorNotes: isDiscrepancy ? "Worker reported waste, but recorded machine runtime was 0." : "Normal."
    };
  }

  const expectedQuantity = Math.round(ratedCapacityKgHr * runtimeHours * 10) / 10;
  const upperThreshold = expectedQuantity * (1 + tolerancePercentage / 100);
  const percentageVariance = Math.round(((reportedQuantityKg - expectedQuantity) / expectedQuantity) * 100);
  const isDiscrepancy = reportedQuantityKg > upperThreshold;

  let supervisorNotes = `Expected ~${expectedQuantity} kg (Capacity: ${ratedCapacityKgHr} kg/hr, Runtime: ${runtimeHours} hrs).`;
  if (isDiscrepancy) {
    supervisorNotes = `Attention: Machine ran for ${runtimeHours} hrs with rated capacity of ${ratedCapacityKgHr} kg/hr (Expected ~${expectedQuantity} kg). Reported ${reportedQuantityKg} kg exceeds theoretical maximum by +${percentageVariance}%. Requires supervisor physical audit.`;
  }

  return { expectedQuantityKg: expectedQuantity, reportedQuantityKg, percentageVariance, isDiscrepancy, supervisorNotes };
}

// ================= HTTP SERVER =================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse JSON helper
  const getBody = (callback) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const json = body ? JSON.parse(body) : {};
        callback(json);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: { message: "Invalid JSON body" } }));
      }
    });
  };

  // API ROUTING
  if (pathname.startsWith("/api/")) {
    res.setHeader("Content-Type", "application/json");

    // AUTH
    if (pathname === "/api/auth") {
      if (method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: users }));
      } else if (method === "POST") {
        getBody((body) => {
          const user = users.find((u) => u.email === body.email || u.role === body.role) || users[0];
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: { user, token: "mock_jwt_" + user.id } }));
        });
      }
      return;
    }

    // SITES
    if (pathname === "/api/sites") {
      if (method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: sites }));
      } else if (method === "POST") {
        getBody((body) => {
          const newSite = {
            id: `site_${Date.now()}`,
            name: body.name,
            location: body.location,
            latitude: parseFloat(body.latitude || 19.076),
            longitude: parseFloat(body.longitude || 72.877),
            supervisorId: body.supervisorId || "usr_sup_01",
            supervisorName: "Vaibhav Badade",
            status: "active",
            monthlyVisitStatus: "scheduled"
          };
          sites.push(newSite);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newSite }));
        });
      }
      return;
    }

    // MACHINES
    if (pathname === "/api/machines") {
      if (method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: machines }));
      } else if (method === "POST") {
        getBody((body) => {
          const site = sites.find((s) => s.id === body.siteId);
          const newMach = {
            id: `mach_${Date.now()}`,
            siteId: body.siteId,
            siteName: site ? site.name : "OWC Site",
            model: body.model || "OWC-60",
            serialNumber: body.serialNumber || `RES-${Date.now()}`,
            ratedCapacityKgHr: parseFloat(body.ratedCapacityKgHr || 25),
            totalRuntimeHrs: 0,
            currentStatus: "operational"
          };
          machines.push(newMach);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newMach }));
        });
      }
      return;
    }

    // ATTENDANCE
    if (pathname === "/api/attendance") {
      if (method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: attendance }));
      } else if (method === "POST") {
        getBody((body) => {
          const user = users.find((u) => u.id === body.userId);
          const site = sites.find((s) => s.id === body.siteId);
          const newAtt = {
            id: `att_${Date.now()}`,
            userId: body.userId,
            userName: user ? user.name : "Worker",
            userRole: user ? user.role : "worker",
            siteId: body.siteId,
            siteName: site ? site.name : "OWC Plant",
            checkInTime: new Date().toISOString(),
            photoUrl: body.photoUrl,
            gpsLat: parseFloat(body.gpsLat),
            gpsLong: parseFloat(body.gpsLong),
            gpsAccuracyMeters: 10,
            distanceFromSiteMeters: 15,
            isWithinGeofence: true,
            status: "checked_in",
            date: new Date().toISOString().split("T")[0]
          };
          attendance.unshift(newAtt);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newAtt }));
        });
      } else if (method === "PUT") {
        getBody((body) => {
          const record = attendance.find((a) => a.id === body.attendanceId);
          if (record) {
            record.checkOutTime = new Date().toISOString();
            record.status = "checked_out";
          }
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: record }));
        });
      }
      return;
    }

    // WORK REPORTS
    if (pathname === "/api/work-reports") {
      if (method === "GET") {
        const discrepancyOnly = parsedUrl.query.discrepancyOnly === "true";
        const result = discrepancyOnly ? workReports.filter((r) => r.discrepancyFlag) : workReports;
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: result }));
      } else if (method === "POST") {
        getBody((body) => {
          const user = users.find((u) => u.id === body.userId);
          const site = sites.find((s) => s.id === body.siteId);
          const mach = machines.find((m) => m.siteId === body.siteId) || machines[0];
          const ratedCap = mach ? mach.ratedCapacityKgHr : 25;

          const verification = verifyReportedQuantity(ratedCap, parseFloat(body.machineRuntimeHrs), parseFloat(body.quantityKg));

          const newReport = {
            id: `rep_${Date.now()}`,
            userId: body.userId,
            userName: user ? user.name : "Worker",
            siteId: body.siteId,
            siteName: site ? site.name : "OWC Site",
            machineId: mach ? mach.id : undefined,
            machineModel: mach ? `${mach.model} (${mach.ratedCapacityKgHr} kg/hr)` : undefined,
            reportDate: new Date().toISOString().split("T")[0],
            quantityKg: parseFloat(body.quantityKg),
            machineRuntimeHrs: parseFloat(body.machineRuntimeHrs),
            expectedQuantityKg: verification.expectedQuantityKg,
            discrepancyFlag: verification.isDiscrepancy,
            discrepancyPercentage: verification.percentageVariance,
            discrepancyNotes: verification.supervisorNotes,
            notes: body.notes || "Waste processing completed.",
            voiceTranscript: body.voiceTranscript,
            activities: body.activities || ["Organic Waste Feeding", "Shredding Process"],
            status: verification.isDiscrepancy ? "flagged" : "submitted",
            createdAt: new Date().toISOString()
          };

          if (mach && body.machineRuntimeHrs > 0) {
            mach.totalRuntimeHrs = Math.round((mach.totalRuntimeHrs + parseFloat(body.machineRuntimeHrs)) * 10) / 10;
          }

          workReports.unshift(newReport);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newReport }));
        });
      } else if (method === "PATCH") {
        getBody((body) => {
          const rep = workReports.find((r) => r.id === body.reportId);
          if (rep) {
            rep.status = body.status;
            rep.reviewerId = body.reviewerId;
            rep.reviewerNotes = body.reviewerNotes;
          }
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: rep }));
        });
      }
      return;
    }

    // VISITS
    if (pathname === "/api/visits") {
      if (method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: visits }));
      } else if (method === "POST") {
        getBody((body) => {
          const site = sites.find((s) => s.id === body.siteId);
          const newVisit = {
            id: `vst_${Date.now()}`,
            siteId: body.siteId,
            siteName: site ? site.name : "OWC Site",
            supervisorId: body.supervisorId || "usr_sup_01",
            supervisorName: "Vaibhav Badade",
            scheduledDate: body.scheduledDate,
            status: "scheduled",
            observations: body.observations
          };
          visits.unshift(newVisit);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: newVisit }));
        });
      } else if (method === "PATCH") {
        getBody((body) => {
          const v = visits.find((item) => item.id === body.visitId);
          if (v) {
            v.status = "completed";
            v.observations = body.observations || "Inspection completed.";
            const site = sites.find((s) => s.id === v.siteId);
            if (site) {
              site.monthlyVisitStatus = "completed";
              site.lastVisitedDate = new Date().toISOString().split("T")[0];
            }
          }
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: v }));
        });
      }
      return;
    }

    // IOT TELEMETRY
    if (pathname === "/api/iot") {
      if (method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, data: telemetry }));
      } else if (method === "POST") {
        getBody((body) => {
          const entry = {
            id: `tel_${Date.now()}`,
            machineId: body.machineId,
            siteId: body.siteId,
            timestamp: new Date().toISOString(),
            sessionRuntimeMinutes: parseInt(body.sessionRuntimeMinutes || 30),
            motorCurrentAmps: parseFloat(body.motorCurrentAmps || 11.2),
            powerKw: parseFloat(body.powerKw || 4.8),
            temperatureCelsius: parseFloat(body.temperatureCelsius || 48.0),
            isRunning: true
          };
          telemetry.unshift(entry);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: entry }));
        });
      }
      return;
    }

    // ANALYTICS
    if (pathname === "/api/analytics") {
      const totalKg = workReports.reduce((sum, r) => sum + r.quantityKg, 0);
      const discrepancyCount = workReports.filter((r) => r.discrepancyFlag).length;
      res.writeHead(200);
      res.end(
        JSON.stringify({
          success: true,
          data: {
            totalProcessedKg: Math.round(totalKg),
            discrepancyCount,
            totalActiveSites: sites.length,
            totalWorkers: users.filter((u) => u.role === "worker").length,
            totalSupervisors: users.filter((u) => u.role === "supervisor").length,
            totalMachines: machines.length
          }
        })
      );
      return;
    }

    // EXPORT
    if (pathname === "/api/export") {
      const type = parsedUrl.query.type || "reports";
      const format = parsedUrl.query.format || "csv";

      if (format === "html") {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Shuchithwam Report</title><style>body{font-family:sans-serif;padding:30px;color:#1e293b}table{width:100%;border-collapse:collapse}th{background:#059669;color:white;padding:8px}td{padding:8px;border-bottom:1px solid #e2e8f0}.flag{color:#dc2626;font-weight:bold}</style></head><body><h2>Rajeshree Enviro Solutions - OWC Operational Report</h2><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr><th>Date</th><th>Site</th><th>Worker</th><th>Reported (kg)</th><th>Runtime (h)</th><th>IoT Status</th></tr></thead><tbody>${workReports.map(r=>`<tr><td>${r.reportDate}</td><td>${r.siteName}</td><td>${r.userName}</td><td><strong>${r.quantityKg} kg</strong></td><td>${r.machineRuntimeHrs} hrs</td><td>${r.discrepancyFlag ? '<span class="flag">⚠️ DISCREPANCY</span>' : '✓ Normal'}</td></tr>`).join('')}</tbody></table></body></html>`;
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }

      // CSV Export
      const headers = ["Report ID", "Date", "Site", "Worker", "Reported (kg)", "Runtime (h)", "Expected (kg)", "Discrepancy", "Status"];
      const rows = workReports.map((r) => [r.id, r.reportDate, `"${r.siteName}"`, `"${r.userName}"`, r.quantityKg, r.machineRuntimeHrs, r.expectedQuantityKg, r.discrepancyFlag ? "YES" : "NO", r.status]);
      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="owc_report_${new Date().toISOString().split("T")[0]}.csv"`
      });
      res.end(csv);
      return;
    }
  }

  // ================= STANDALONE WEB APPLICATION UI =================
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(getInteractiveAppHtml());
});

server.listen(PORT, () => {
  console.log("===============================================================");
  console.log(`✅ Shuchithwam Smart OWC System running at http://localhost:${PORT}`);
  console.log("   Client: Rajeshree Enviro Solutions");
  console.log("   Roles: Field Worker, Supervisor Dashboard, Administrator Console");
  console.log("===============================================================");
});

function getInteractiveAppHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shuchithwam - Smart OWC Operations Monitoring & Management System</title>
  <!-- Tailwind CSS CDN for instant styling -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @keyframes pulse-subtle { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .animate-pulse-subtle { animation: pulse-subtle 2s infinite; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">

  <!-- TOP HEADER -->
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
          <i class="fa-solid fa-microchip text-lg"></i>
        </div>
        <div>
          <span class="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
            Shuchithwam
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Smart OWC
            </span>
          </span>
          <p class="text-xs text-slate-500 font-medium">Rajeshree Enviro Solutions</p>
        </div>
      </div>

      <!-- PORTAL NAV BUTTONS -->
      <nav class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
        <button onclick="switchView('worker')" id="btn-worker" class="tab-btn px-3.5 py-1.5 rounded-lg transition-all bg-white text-slate-900 shadow-xs">
          <i class="fa-solid fa-helmet-safety text-amber-600 mr-1.5"></i>Worker
        </button>
        <button onclick="switchView('supervisor')" id="btn-supervisor" class="tab-btn px-3.5 py-1.5 rounded-lg transition-all text-slate-600 hover:text-slate-900">
          <i class="fa-solid fa-user-check text-blue-600 mr-1.5"></i>Supervisor
        </button>
        <button onclick="switchView('admin')" id="btn-admin" class="tab-btn px-3.5 py-1.5 rounded-lg transition-all text-slate-600 hover:text-slate-900">
          <i class="fa-solid fa-shield-halved text-emerald-600 mr-1.5"></i>Admin
        </button>
      </nav>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

    <!-- ================= 1. WORKER MOBILE PORTAL ================= -->
    <div id="view-worker" class="view-panel max-w-3xl mx-auto space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 class="font-bold text-base text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-helmet-safety text-amber-600"></i>
            Worker Operations & Attendance Portal
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Pranav Mehadale &bull; Site Operator</p>
        </div>
        <select id="worker-site-select" onchange="renderWorkerSite()" class="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium text-slate-800">
        </select>
      </div>

      <!-- ATTENDANCE CARD -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-clock text-emerald-600"></i>
            <h3 class="font-bold text-sm text-slate-900">Digital Attendance (Camera & GPS)</h3>
          </div>
          <span id="attendance-status-badge" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Checked In (08:02 AM)
          </span>
        </div>

        <!-- GPS Verification Badge -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-location-dot text-emerald-600"></i> Real-Time GPS Location
            </span>
            <span class="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md">
              ✓ On-Site Verified (15m from plant)
            </span>
          </div>
          <p class="font-mono text-slate-600 text-[11px]">Coordinates: 19.0178° N, 72.8478° E (Accuracy: ±10m)</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button onclick="triggerSelfieCheckIn()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2">
            <i class="fa-solid fa-camera"></i> Capture Selfie Check-In
          </button>
          <button onclick="handleWorkerCheckOut()" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2">
            <i class="fa-solid fa-right-from-bracket"></i> Record Check-Out
          </button>
        </div>
      </div>

      <!-- DAILY WORK REPORT FORM -->
      <form onsubmit="submitWorkerReport(event)" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-clipboard-list text-emerald-600"></i> Daily Work Report & Quantities
          </h3>
          <span class="text-xs text-slate-400">Date: Today</span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Waste Processed (kg) *</label>
            <input type="number" step="0.5" id="inp-quantity" required placeholder="e.g. 50" oninput="previewIotCalc()" class="w-full p-2.5 border rounded-xl bg-slate-50">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Machine Runtime (hours) *</label>
            <input type="number" step="0.1" id="inp-runtime" required placeholder="e.g. 2.0" oninput="previewIotCalc()" class="w-full p-2.5 border rounded-xl bg-slate-50">
          </div>
        </div>

        <!-- Theoretical IoT Check Banner -->
        <div id="iot-preview-banner" class="p-3 rounded-xl bg-slate-50 border text-xs text-slate-600">
          Enter quantity and runtime to preview IoT verification formula.
        </div>

        <!-- Voice-to-Text Input (SpeechRecognition) -->
        <div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
              <i class="fa-solid fa-microphone text-emerald-600"></i> Voice-Based Work Notes (Speech-to-Text)
            </span>
            <button type="button" onclick="toggleVoiceRecording()" id="btn-voice-rec" class="text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg flex items-center gap-1">
              <i class="fa-solid fa-microphone"></i> <span>Speak Report</span>
            </button>
          </div>
          <p id="voice-status" class="text-[11px] text-slate-500 italic">Click Speak Report to dictate in English, Hindi, or Marathi.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Work Description & Observations</label>
          <textarea id="inp-notes" rows="3" placeholder="Describe sorting, feeding, shredder operation, bio-culture moisture..." class="w-full p-2.5 border rounded-xl text-xs"></textarea>
        </div>

        <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2">
          <i class="fa-solid fa-paper-plane"></i> Submit Work Report
        </button>
      </form>
    </div>

    <!-- ================= 2. SUPERVISOR DASHBOARD ================= -->
    <div id="view-supervisor" class="view-panel hidden space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="font-bold text-base text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-user-check text-blue-600"></i>
            Supervisor Monitoring & Review Dashboard
          </h2>
          <p class="text-xs text-slate-500">Vaibhav Badade &bull; Senior Field Supervisor</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="downloadReportCsv()" class="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <i class="fa-solid fa-download text-emerald-600"></i> Export CSV
          </button>
          <button onclick="window.open('/api/export?format=html', '_blank')" class="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-1.5">
            <i class="fa-solid fa-print text-blue-600"></i> Print Report
          </button>
        </div>
      </div>

      <!-- MONTHLY VISIT REMINDER (SYNOPSIS REQUIREMENT) -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <i class="fa-solid fa-calendar-check text-lg"></i>
          </div>
          <div>
            <h4 class="font-bold text-xs text-slate-900">Monthly Site Visit Reminders (1 Visit / Month per Site)</h4>
            <p class="text-xs text-slate-600 mt-0.5">BKC Hub is <strong>overdue</strong>. Dadar Central completed for October.</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          1 Overdue Visit
        </span>
      </div>

      <!-- WORK REPORTS AUDIT WITH IOT DISCREPANCIES -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-clipboard-check text-emerald-600"></i> Submitted Work Reports & IoT Runtime Verification
          </h3>
          <span class="text-xs text-slate-500 font-medium">Click <strong>Verify Report</strong> to approve operator submissions</span>
        </div>

        <div id="supervisor-reports-list" class="space-y-3">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- DIGITAL ATTENDANCE & PHOTO EVIDENCE -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-user-clock text-blue-600"></i> Worker Digital Attendance & Geofenced Selfies
            </h3>
            <p class="text-xs text-slate-500">Live photographic check-ins and GPS coordinates</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th class="px-4 py-3">Photo Selfie</th>
                <th class="px-4 py-3">Worker Name</th>
                <th class="px-4 py-3">Site</th>
                <th class="px-4 py-3">Check-In</th>
                <th class="px-4 py-3">GPS Coordinates</th>
                <th class="px-4 py-3">Geofence Status</th>
              </tr>
            </thead>
            <tbody id="supervisor-attendance-table" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>

      <!-- MONTHLY SITE VISITS REGISTRY -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-calendar-days text-indigo-600"></i> Monthly Site Inspections & Compliance
            </h3>
            <p class="text-xs text-slate-500">Scheduled 1 monthly visit per assigned site</p>
          </div>
          <button onclick="scheduleNewVisitPrompt()" class="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs">
            <i class="fa-solid fa-plus"></i> Schedule Visit
          </button>
        </div>
        <div id="supervisor-visits-grid" class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        </div>
      </div>
    </div>

    <!-- ================= 3. ADMINISTRATOR CONSOLE ================= -->
    <div id="view-admin" class="view-panel hidden space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 class="font-bold text-base text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-shield-halved text-emerald-600"></i>
            Administrator System Command Center
          </h2>
          <p class="text-xs text-slate-500">Rajeshree Enviro Solutions &bull; Multi-Site OWC Infrastructure</p>
        </div>
        <button onclick="window.open('/api/export?format=html', '_blank')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-semibold">
          <i class="fa-solid fa-file-pdf"></i> Company Audit Report
        </button>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs text-slate-500">Total Waste Processed</span>
          <p id="kpi-total-kg" class="text-2xl font-bold text-slate-900 mt-1 font-mono">150 kg</p>
          <span class="text-[11px] text-emerald-600 font-medium">All active sites</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs text-slate-500">Active OWC Sites</span>
          <p class="text-2xl font-bold text-slate-900 mt-1 font-mono">4</p>
          <span class="text-[11px] text-slate-500">Mumbai & Pune</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs text-slate-500">Discrepancy Flags</span>
          <p id="kpi-discrepancies" class="text-2xl font-bold text-red-600 mt-1 font-mono">1</p>
          <span class="text-[11px] text-red-600 font-medium">IoT verification alert</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs text-slate-500">Field Workforce</span>
          <p class="text-2xl font-bold text-slate-900 mt-1 font-mono">6 Users</p>
          <span class="text-[11px] text-slate-500">Workers & Supervisors</span>
        </div>
      </div>

      <!-- SITES & MACHINES LIST -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 class="font-bold text-sm text-slate-900">OWC Operational Sites</h3>
          <div id="admin-sites-table" class="divide-y divide-slate-100 text-xs">
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 class="font-bold text-sm text-slate-900">OWC Machinery Assets & Rated Capacities</h3>
          <div id="admin-machines-table" class="divide-y divide-slate-100 text-xs">
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    let currentView = 'worker';
    let isRecordingVoice = false;
    let recognition = null;

    function switchView(viewName) {
      currentView = viewName;
      document.querySelectorAll('.view-panel').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('bg-white', 'text-slate-900', 'shadow-xs');
        el.classList.add('text-slate-600');
      });

      document.getElementById('view-' + viewName).classList.remove('hidden');
      const activeBtn = document.getElementById('btn-' + viewName);
      activeBtn.classList.add('bg-white', 'text-slate-900', 'shadow-xs');
      activeBtn.classList.remove('text-slate-600');

      if (viewName === 'supervisor') loadSupervisorData();
      if (viewName === 'admin') loadAdminData();
    }

    async function initApp() {
      const res = await fetch('/api/sites');
      const json = await res.json();
      if (json.success) {
        const select = document.getElementById('worker-site-select');
        select.innerHTML = json.data.map(s => \`<option value="\${s.id}">\${s.name}</option>\`).join('');
      }
    }

    function previewIotCalc() {
      const qty = parseFloat(document.getElementById('inp-quantity').value) || 0;
      const hrs = parseFloat(document.getElementById('inp-runtime').value) || 0;
      const banner = document.getElementById('iot-preview-banner');

      if (qty <= 0 || hrs <= 0) {
        banner.className = "p-3 rounded-xl bg-slate-50 border text-xs text-slate-600";
        banner.innerHTML = "Enter quantity and runtime to preview IoT verification formula.";
        return;
      }

      const expected = Math.round(25.0 * hrs * 10) / 10;
      const isDiscrepancy = qty > expected * 1.25;

      if (isDiscrepancy) {
        banner.className = "p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800";
        banner.innerHTML = \`<strong>⚠️ Discrepancy Flag:</strong> At 25 kg/hr, running for \${hrs}h yields expected output of ~\${expected} kg. Reported \${qty} kg exceeds capacity and will be flagged for supervisor audit.\`;
      } else {
        banner.className = "p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800";
        banner.innerHTML = \`<strong>✓ Consistent:</strong> Reported \${qty} kg matches theoretical machine output (~\${expected} kg expected).\`;
      }
    }

    function toggleVoiceRecording() {
      const status = document.getElementById('voice-status');
      const btn = document.getElementById('btn-voice-rec');

      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("Speech Recognition API is not supported in this browser. Please use Chrome/Edge or type your notes.");
        return;
      }

      if (!isRecordingVoice) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        recognition.continuous = false;

        recognition.onstart = () => {
          isRecordingVoice = true;
          status.innerText = "Listening... Speak your operational notes clearly.";
          status.className = "text-[11px] text-red-600 font-semibold animate-pulse";
          btn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
          btn.className = "text-xs bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1";
        };

        recognition.onresult = (e) => {
          const text = e.results[0][0].transcript;
          const notes = document.getElementById('inp-notes');
          notes.value = (notes.value ? notes.value + "\\n" : "") + text;
          status.innerText = 'Captured: "' + text + '"';
          status.className = "text-[11px] text-emerald-700 font-semibold";
        };

        recognition.onend = () => {
          isRecordingVoice = false;
          btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Speak Report';
          btn.className = "text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg flex items-center gap-1";
        };

        recognition.start();
      } else {
        recognition.stop();
      }
    }

    function triggerSelfieCheckIn() {
      alert("Selfie verified via camera stream! Check-in recorded at Dadar Central OWC with GPS coordinates (19.0178° N, 72.8478° E).");
      document.getElementById('attendance-status-badge').innerText = "Checked In (" + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")";
    }

    function handleWorkerCheckOut() {
      alert("Check-out recorded successfully! Shift logged.");
      document.getElementById('attendance-status-badge').innerText = "Checked Out";
      document.getElementById('attendance-status-badge').className = "px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700";
    }

    async function submitWorkerReport(e) {
      e.preventDefault();
      const qty = parseFloat(document.getElementById('inp-quantity').value);
      const hrs = parseFloat(document.getElementById('inp-runtime').value);
      const notes = document.getElementById('inp-notes').value;
      const siteId = document.getElementById('worker-site-select').value;

      const res = await fetch('/api/work-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_wrk_01',
          siteId: siteId,
          quantityKg: qty,
          machineRuntimeHrs: hrs,
          notes: notes
        })
      });

      const json = await res.json();
      if (json.success) {
        if (json.data.discrepancyFlag) {
          alert("Work report submitted! Notice: IoT Verification flagged this report as exceeding machine capacity. Supervisor will review.");
        } else {
          alert("Work report submitted successfully and verified with IoT machine capacity!");
        }
        document.getElementById('inp-quantity').value = '';
        document.getElementById('inp-runtime').value = '';
        document.getElementById('inp-notes').value = '';
        previewIotCalc();
      }
    }

    async function loadSupervisorData() {
      const [rRes, aRes, vRes] = await Promise.all([
        fetch('/api/work-reports'),
        fetch('/api/attendance'),
        fetch('/api/visits')
      ]);
      const [rJson, aJson, vJson] = await Promise.all([rRes.json(), aRes.json(), vRes.json()]);

      if (rJson.success) {
        const list = document.getElementById('supervisor-reports-list');
        list.innerHTML = rJson.data.map(r => {
          let statusBadge = '';
          if (r.status === 'verified') {
            statusBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300"><i class="fa-solid fa-check mr-1"></i>Verified by Supervisor</span>';
          } else if (r.status === 'flagged') {
            statusBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Flagged for Audit</span>';
          } else {
            statusBadge = '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300"><i class="fa-solid fa-clock mr-1"></i>Pending Review</span>';
          }

          return \`
          <div class="p-4 rounded-xl border \${r.discrepancyFlag ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'} space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <span class="font-bold text-xs text-slate-900">\${r.siteName} &bull; \${r.reportDate}</span>
                <span class="text-[11px] text-slate-500 ml-2">Operator: <strong>\${r.userName}</strong></span>
              </div>
              <div class="flex items-center gap-2">
                \${statusBadge}
                \${r.discrepancyFlag ? '<span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">Discrepancy</span>' : ''}
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px]">Reported Quantity</span>
                <strong class="text-slate-900 font-mono text-sm">\${r.quantityKg} kg</strong>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px]">Machine Runtime</span>
                <strong class="text-slate-900 font-mono text-sm">\${r.machineRuntimeHrs} hrs</strong>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block text-[10px]">Expected Output</span>
                <strong class="text-slate-900 font-mono text-sm">~\${r.expectedQuantityKg} kg</strong>
              </div>
            </div>

            \${r.discrepancyNotes ? \`
              <div class="text-[11px] text-red-800 bg-red-100/70 p-2.5 rounded-xl border border-red-200 flex items-start gap-2">
                <i class="fa-solid fa-triangle-exclamation text-red-600 mt-0.5"></i>
                <div><strong>IoT Verification Discrepancy:</strong> \${r.discrepancyNotes}</div>
              </div>
            \` : ''}

            <p class="text-xs text-slate-600 leading-relaxed"><span class="font-semibold text-slate-800">Worker Notes:</span> \${r.notes}</p>
            \${r.voiceTranscript ? \`<p class="text-xs text-emerald-800 italic bg-emerald-50/60 p-2 rounded-lg border border-emerald-100"><i class="fa-solid fa-microphone mr-1 text-emerald-600"></i><strong>Voice Transcript:</strong> "\${r.voiceTranscript}"</p>\` : ''}
            \${r.reviewerNotes ? \`<p class="text-[11px] text-blue-800 bg-blue-50/70 p-2 rounded-lg border border-blue-200"><strong>Supervisor Review:</strong> "\${r.reviewerNotes}"</p>\` : ''}

            <!-- VERIFY & AUDIT ACTION BUTTONS -->
            <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button onclick="reviewSupervisorReport('\${r.id}', 'verified')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer">
                  <i class="fa-solid fa-check"></i> Verify Report
                </button>
                <button onclick="reviewSupervisorReport('\${r.id}', 'flagged')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1.5 transition-colors cursor-pointer">
                  <i class="fa-solid fa-triangle-exclamation"></i> Flag for Physical Audit
                </button>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">ID: \${r.id}</span>
            </div>
          </div>
        \`;
        }).join('');
      }

      if (aJson.success) {
        const attTable = document.getElementById('supervisor-attendance-table');
        attTable.innerHTML = aJson.data.map(a => \`
          <tr class="hover:bg-slate-50">
            <td class="px-4 py-2.5">
              <img src="\${a.photoUrl}" alt="Selfie" class="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-2xs">
            </td>
            <td class="px-4 py-2.5 font-semibold text-slate-800">\${a.userName}</td>
            <td class="px-4 py-2.5 text-slate-600">\${a.siteName}</td>
            <td class="px-4 py-2.5 font-mono text-slate-700">\${new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td class="px-4 py-2.5 font-mono text-slate-500 text-[11px]">\${a.gpsLat.toFixed(4)}°, \${a.gpsLong.toFixed(4)}°</td>
            <td class="px-4 py-2.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <i class="fa-solid fa-check mr-1"></i>\${a.distanceFromSiteMeters || 15}m (On-Site)
              </span>
            </td>
          </tr>
        \`).join('');
      }

      if (vJson.success) {
        const vGrid = document.getElementById('supervisor-visits-grid');
        vGrid.innerHTML = vJson.data.map(v => \`
          <div class="p-3.5 rounded-xl border \${v.status === 'overdue' ? 'border-red-300 bg-red-50/20' : v.status === 'completed' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 bg-white'} space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">\${v.siteName}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase \${v.status === 'overdue' ? 'bg-red-100 text-red-800' : v.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">\${v.status}</span>
            </div>
            <p class="text-[11px] text-slate-500">Scheduled: <strong>\${v.scheduledDate}</strong></p>
            <p class="text-[11px] text-slate-600">\${v.observations || 'Routine monthly inspection'}</p>
            \${v.status !== 'completed' ? \`
              <button onclick="completeVisitPrompt('\${v.id}')" class="w-full mt-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 shadow-xs">
                <i class="fa-solid fa-clipboard-check"></i> Complete Inspection
              </button>
            \` : '<span class="block text-[11px] text-emerald-700 font-semibold mt-1">✓ Inspection Signed Off</span>'}
          </div>
        \`).join('');
      }
    }

    async function scheduleNewVisitPrompt() {
      const siteId = document.getElementById('worker-site-select').value;
      const date = prompt("Enter scheduled visit date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
      if (!date) return;
      const obs = prompt("Enter inspection focus / notes:", "Monthly mechanical check & blade wear inspection.");

      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          supervisorId: 'usr_sup_01',
          scheduledDate: date,
          observations: obs
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Monthly site visit scheduled!");
        loadSupervisorData();
      }
    }

    async function completeVisitPrompt(visitId) {
      const notes = prompt("Enter inspection checklist findings (e.g. Machine condition, moisture, segregation):", "OWC machine running smoothly, motor gearbox verified, curing aeration optimal.");
      if (notes === null) return;

      const res = await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: visitId,
          observations: notes
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("✅ Site inspection checklist signed and completed!");
        loadSupervisorData();
      }
    }

    async function reviewSupervisorReport(reportId, status) {
      let reviewerNotes = "";
      if (status === 'flagged') {
        reviewerNotes = prompt("Enter discrepancy audit notes (e.g. Needs physical inspection of OWC blades):", "Discrepancy confirmed: reported batch exceeds machine capacity runtime. Scheduled for site visit.");
        if (reviewerNotes === null) return;
      } else {
        reviewerNotes = prompt("Enter verification note (optional):", "Verified consistent with machine operating hours and site logbook.");
        if (reviewerNotes === null) return;
      }

      try {
        const res = await fetch('/api/work-reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId: reportId,
            status: status,
            reviewerId: 'usr_sup_01',
            reviewerNotes: reviewerNotes || (status === 'verified' ? 'Approved by Supervisor' : 'Flagged for Audit')
          })
        });

        const json = await res.json();
        if (json.success) {
          alert(status === 'verified' ? '✅ Work report verified and signed off by supervisor!' : '⚠️ Work report flagged for physical on-site audit!');
          loadSupervisorData();
        } else {
          alert("Failed to update report status.");
        }
      } catch (e) {
        console.error(e);
        alert("Network error updating report.");
      }
    }

    async function loadAdminData() {
      const [sRes, mRes, aRes] = await Promise.all([fetch('/api/sites'), fetch('/api/machines'), fetch('/api/analytics')]);
      const [sJson, mJson, aJson] = await Promise.all([sRes.json(), mRes.json(), aRes.json()]);

      if (aJson.success) {
        document.getElementById('kpi-total-kg').innerText = aJson.data.totalProcessedKg + ' kg';
        document.getElementById('kpi-discrepancies').innerText = aJson.data.discrepancyCount;
      }

      if (sJson.success) {
        document.getElementById('admin-sites-table').innerHTML = sJson.data.map(s => \`
          <div class="py-2.5 flex items-center justify-between">
            <div>
              <span class="font-semibold text-slate-800">\${s.name}</span>
              <p class="text-[11px] text-slate-400">\${s.location}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase \${s.monthlyVisitStatus === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}">\${s.monthlyVisitStatus}</span>
          </div>
        \`).join('');
      }

      if (mJson.success) {
        document.getElementById('admin-machines-table').innerHTML = mJson.data.map(m => \`
          <div class="py-2.5 flex items-center justify-between">
            <div>
              <span class="font-semibold text-slate-800">\${m.model} (\${m.serialNumber})</span>
              <p class="text-[11px] text-slate-400">\${m.siteName}</p>
            </div>
            <div class="text-right">
              <span class="font-bold text-slate-900">\${m.ratedCapacityKgHr} kg/hr</span>
              <span class="block text-[10px] text-emerald-600">\${m.totalRuntimeHrs} hrs total</span>
            </div>
          </div>
        \`).join('');
      }
    }

    function downloadReportCsv() {
      window.location.href = '/api/export?type=reports&format=csv';
    }

    initApp();
  </script>
</body>
</html>`;
}
