"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useSite } from "@/src/context/SiteContext";
import { useNotifications } from "@/src/context/NotificationContext";
import { WorkReport, Attendance, SupervisorVisit } from "@/src/types";
import {
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  Download,
  Filter,
  Check,
  X,
  Eye,
  Plus,
  Building2,
  HardHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ExportModal from "@/components/common/ExportModal";
import DiscrepancyBadge from "@/components/reporting/DiscrepancyBadge";
import IoTTelemetryViewer from "@/components/iot/IoTTelemetryViewer";

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { sites, activeSite, setActiveSiteId, activeMachines } = useSite();
  const { overdueVisitsCount } = useNotifications();

  // Data states
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [visits, setVisits] = useState<SupervisorVisit[]>([]);
  const [activeTab, setActiveTab] = useState<"reports" | "attendance" | "visits" | "iot">("reports");
  const [filterDiscrepancyOnly, setFilterDiscrepancyOnly] = useState(false);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isScheduleVisitModalOpen, setIsScheduleVisitModalOpen] = useState(false);
  const [isCompleteVisitModalOpen, setIsCompleteVisitModalOpen] = useState<SupervisorVisit | null>(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Form states for visit scheduling
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [machineCondition, setMachineCondition] = useState<"good" | "fair" | "needs_repair">("good");

  const loadData = async () => {
    try {
      const siteParam = activeSite ? `?siteId=${activeSite.id}` : "";

      const [repRes, attRes, vstRes] = await Promise.all([
        fetch(`/api/work-reports${siteParam}`),
        fetch(`/api/attendance${siteParam}`),
        fetch(`/api/visits${siteParam}`),
      ]);

      const [repJson, attJson, vstJson] = await Promise.all([
        repRes.json(),
        attRes.json(),
        vstRes.json(),
      ]);

      if (repJson.success) setReports(repJson.data);
      if (attJson.success) setAttendance(attJson.data);
      if (vstJson.success) setVisits(vstJson.data);
    } catch (e) {
      console.error("Supervisor data fetch error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSite]);

  // Handle Report Review
  const handleReviewReport = async (reportId: string, status: "verified" | "flagged") => {
    if (!user) return;
    const reviewerNotes = prompt("Enter supervisor review notes (optional):") || undefined;
    try {
      const res = await fetch("/api/work-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          reviewerId: user.id,
          reviewerNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? json.data : r)));
      }
    } catch (e) {
      console.error("Failed to update report:", e);
    }
  };

  // Schedule Monthly Visit
  const handleScheduleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite || !user) return;
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: activeSite.id,
          supervisorId: user.id,
          scheduledDate: scheduleDate,
          observations: scheduleNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVisits((prev) => [json.data, ...prev]);
        setIsScheduleVisitModalOpen(false);
        setScheduleNotes("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete Monthly Visit with checklist
  const handleCompleteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCompleteVisitModalOpen) return;
    try {
      const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: isCompleteVisitModalOpen.id,
          observations: inspectionNotes || "Routine monthly inspection conducted.",
          checklist: {
            machineCondition,
            workerHygieneCompliance: true,
            wasteSegregationQuality: "high",
            logbookMatch: true,
            curingBayStatus: "optimal",
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVisits((prev) =>
          prev.map((v) => (v.id === isCompleteVisitModalOpen.id ? json.data : v))
        );
        setIsCompleteVisitModalOpen(null);
        setInspectionNotes("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const displayedReports = filterDiscrepancyOnly
    ? reports.filter((r) => r.discrepancyFlag)
    : reports;

  const totalFlaggedCount = reports.filter((r) => r.discrepancyFlag).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Site Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Supervisor Site Monitoring & Review Console
            </h1>
            <p className="text-xs text-slate-500">
              Assigned Supervisor: <span className="font-semibold text-slate-700">{user?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Site Selector */}
          <select
            value={activeSite?.id || ""}
            onChange={(e) => setActiveSiteId(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-emerald-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.location.split(",")[0]})
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-9 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Export Reports
          </Button>

          <Button
            size="sm"
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsScheduleVisitModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Schedule Site Visit
          </Button>
        </div>
      </div>

      {/* Monthly Visit Reminder Banner (Synopsis Section 3.8) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">
                Monthly Site Visit Schedule (1 Visit / Month)
              </span>
              {activeSite?.monthlyVisitStatus === "overdue" && (
                <Badge className="bg-red-100 text-red-800 border-red-300 text-[10px]">
                  Overdue Inspection
                </Badge>
              )}
              {activeSite?.monthlyVisitStatus === "completed" && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                  Completed for Month
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Active Site: <span className="font-semibold">{activeSite?.name}</span> &bull; Last inspected:{" "}
              {activeSite?.lastVisitedDate || "None"}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100 self-start sm:self-auto"
          onClick={() => setActiveTab("visits")}
        >
          View Visit Registry
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "reports"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Daily Work Reports ({reports.length})
          {totalFlaggedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {totalFlaggedCount} Flagged
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "attendance"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Digital Attendance Log ({attendance.length})
        </button>

        <button
          onClick={() => setActiveTab("visits")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "visits"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Monthly Visits ({visits.length})
        </button>

        <button
          onClick={() => setActiveTab("iot")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "iot"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          IoT Telemetry & Machines
        </button>
      </div>

      {/* TAB 1: WORK REPORTS & IOT DISCREPANCY AUDIT */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing {displayedReports.length} reports for {activeSite?.name || "all sites"}
            </span>
            <button
              onClick={() => setFilterDiscrepancyOnly(!filterDiscrepancyOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterDiscrepancyOnly
                  ? "bg-red-50 border-red-300 text-red-700 font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-3 h-3" />
              {filterDiscrepancyOnly ? "Showing Discrepancies Only" : "Filter Discrepancies"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayedReports.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No work reports found for this filter.
              </div>
            ) : (
              displayedReports.map((r) => (
                <div
                  key={r.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3 ${
                    r.discrepancyFlag ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{r.siteName}</span>
                        <span className="text-xs text-slate-400">&bull; {r.reportDate}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Worker: <span className="font-semibold text-slate-700">{r.userName}</span> &bull; Machine:{" "}
                        {r.machineModel || "OWC Machine"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => handleReviewReport(r.id, "verified")}
                      >
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-red-700 border-red-300 hover:bg-red-50"
                        onClick={() => handleReviewReport(r.id, "flagged")}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
                        Flag for Audit
                      </Button>
                    </div>
                  </div>

                  {/* Quantitative Metrics & IoT Comparison */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Reported Waste</span>
                      <span className="font-bold text-sm text-slate-900 font-mono">{r.quantityKg} kg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Machine Runtime</span>
                      <span className="font-bold text-sm text-slate-900 font-mono">{r.machineRuntimeHrs} hrs</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Expected Output</span>
                      <span className="font-bold text-sm text-slate-900 font-mono">~{r.expectedQuantityKg} kg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                      <DiscrepancyBadge
                        isDiscrepancy={r.discrepancyFlag}
                        quantityKg={r.quantityKg}
                        expectedKg={r.expectedQuantityKg}
                        runtimeHrs={r.machineRuntimeHrs}
                        percentageVariance={r.discrepancyPercentage}
                      />
                    </div>
                  </div>

                  {/* Discrepancy Note banner */}
                  {r.discrepancyNotes && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Discrepancy Alert: </span>
                        {r.discrepancyNotes}
                      </div>
                    </div>
                  )}

                  {/* Activities & Notes */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {r.activities?.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-700 pt-1 leading-relaxed">
                      <span className="font-semibold text-slate-900">Notes: </span>
                      {r.notes}
                    </p>
                    {r.voiceTranscript && (
                      <p className="text-emerald-800 italic bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        <span className="font-semibold not-italic text-emerald-900">🎙️ Voice Transcript: </span>
                        &ldquo;{r.voiceTranscript}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL ATTENDANCE LOG */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Digital Worker Attendance with GPS & Photos</h3>
            <p className="text-xs text-slate-500">Selfie verification and distance coordinates computed from site</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Photo Selfie</th>
                  <th className="px-4 py-3">Worker Name</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Check-In Time</th>
                  <th className="px-4 py-3">Check-Out Time</th>
                  <th className="px-4 py-3">GPS Location</th>
                  <th className="px-4 py-3">Geofence Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <img
                        src={a.photoUrl}
                        alt="Selfie"
                        onClick={() => setSelectedPhotoModal(a.photoUrl)}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs cursor-pointer hover:opacity-80"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{a.userName}</td>
                    <td className="px-4 py-3 text-slate-600">{a.siteName}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {a.checkOutTime
                        ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "Active"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                      {a.gpsLat.toFixed(4)}°, {a.gpsLong.toFixed(4)}°
                    </td>
                    <td className="px-4 py-3">
                      {a.isWithinGeofence ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                          ✓ Within Site ({a.distanceFromSiteMeters || 10}m)
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                          ⚠️ Off-site ({a.distanceFromSiteMeters}m)
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY SITE VISITS REGISTRY */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visits.map((v) => (
              <div
                key={v.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 ${
                  v.status === "overdue"
                    ? "border-red-300 ring-1 ring-red-200"
                    : v.status === "completed"
                    ? "border-emerald-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    className={`text-[10px] uppercase font-bold ${
                      v.status === "overdue"
                        ? "bg-red-100 text-red-800"
                        : v.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {v.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">{v.scheduledDate}</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{v.siteName}</h4>
                  <p className="text-xs text-slate-500">Supervisor: {v.supervisorName}</p>
                </div>

                {v.observations && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {v.observations}
                  </p>
                )}

                {v.status !== "completed" && (
                  <Button
                    size="sm"
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setIsCompleteVisitModalOpen(v)}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Complete Inspection & Checklist
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IOT TELEMETRY & MACHINES */}
      {activeTab === "iot" && (
        <IoTTelemetryViewer machines={activeMachines} />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        siteId={activeSite?.id}
        siteName={activeSite?.name}
      />

      {/* Schedule Visit Modal */}
      {isScheduleVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Schedule Monthly Supervisor Visit</h3>
              <button onClick={() => setIsScheduleVisitModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleScheduleVisitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Site</label>
                <input
                  type="text"
                  disabled
                  value={activeSite?.name || ""}
                  className="w-full p-2 rounded-lg bg-slate-100 border text-slate-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Notes / Objectives</label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Audit OWC machine motor, inspect curing aeration, review worker register"
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                Confirm Schedule
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Complete Inspection Modal with Checklist */}
      {isCompleteVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Complete Site Inspection Checklist</h3>
              <button onClick={() => setIsCompleteVisitModalOpen(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCompleteVisitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">OWC Machine Condition</label>
                <select
                  value={machineCondition}
                  onChange={(e: any) => setMachineCondition(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                >
                  <option value="good">Good - Running smoothly without vibration</option>
                  <option value="fair">Fair - Normal wear, needs grease/lubrication</option>
                  <option value="needs_repair">Needs Maintenance / Blade Inspection</option>
                </select>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <span className="font-semibold block text-slate-700">Audit Compliance Points</span>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" defaultChecked /> Worker Hygiene & Safety (Gloves/Boots)
                </label>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" defaultChecked /> Waste Segregation Quality Verified
                </label>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" defaultChecked /> Curing Bay Moisture & Aeration Optimal
                </label>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supervisor Findings & Notes</label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Detail observations, machine condition, worker conduct..."
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                Save & Sign Inspection Visit
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {selectedPhotoModal && (
        <div
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
        >
          <img
            src={selectedPhotoModal}
            alt="Enlarged evidence"
            className="max-w-md max-h-[80vh] rounded-2xl object-cover shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
