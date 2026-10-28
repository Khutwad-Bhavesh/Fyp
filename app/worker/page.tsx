"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useSite } from "@/src/context/SiteContext";
import { useAttendance } from "@/src/context/AttendanceContext";
import { useGeolocation } from "@/src/hooks/useGeolocation";
import { OWC_OPERATIONAL_ACTIVITIES } from "@/src/config/constants";
import {
  HardHat,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  AlertCircle,
  FileText,
  Sparkles,
  LogOut,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CameraCaptureModal from "@/components/attendance/CameraCaptureModal";
import GpsBadge from "@/components/attendance/GpsBadge";
import VoiceRecorder from "@/components/reporting/VoiceRecorder";
import DiscrepancyBadge from "@/components/reporting/DiscrepancyBadge";
import { calculateDistanceMeters } from "@/src/lib/utils/geo";
import { verifyReportedQuantity } from "@/src/lib/iot/verification";

export default function WorkerPortal() {
  const { user } = useAuth();
  const { sites, activeSite, setActiveSiteId, activeMachines } = useSite();
  const { activeAttendance, isCheckedIn, checkIn, checkOut, history } = useAttendance();
  const geo = useGeolocation();

  // Attendance state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attendancePhoto, setAttendancePhoto] = useState<string | null>(null);
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Work Report form state
  const [quantityKg, setQuantityKg] = useState<string>("");
  const [runtimeHrs, setRuntimeHrs] = useState<string>("");
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    "Waste Segregation & Sorting",
    "Organic Waste Feeding",
  ]);
  const [reportNotes, setReportNotes] = useState<string>("");
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  // Set default machine when activeMachines load
  useEffect(() => {
    if (activeMachines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(activeMachines[0].id);
    }
  }, [activeMachines, selectedMachineId]);

  // Distance calculation
  const distanceToSite =
    geo.latitude && geo.longitude && activeSite
      ? calculateDistanceMeters(
          { latitude: geo.latitude, longitude: geo.longitude },
          { latitude: activeSite.latitude, longitude: activeSite.longitude }
        )
      : null;

  const isWithinPerimeter = distanceToSite !== null ? distanceToSite <= 500 : true;

  // Handle Check-In Submission
  const handlePhotoCaptured = async (photo: string) => {
    setAttendancePhoto(photo);
    if (!activeSite) return;
    setCheckInSubmitting(true);
    setAttendanceMsg(null);

    const res = await checkIn({
      siteId: activeSite.id,
      photoUrl: photo,
      gpsLat: geo.latitude || activeSite.latitude,
      gpsLong: geo.longitude || activeSite.longitude,
      gpsAccuracyMeters: geo.accuracy || 10,
    });

    setCheckInSubmitting(false);
    if (res.success) {
      setAttendanceMsg({ type: "success", text: "Check-in recorded with GPS and photo evidence!" });
    } else {
      setAttendanceMsg({ type: "error", text: res.message || "Failed to record check-in" });
    }
  };

  const handleCheckOut = async () => {
    const ok = await checkOut();
    if (ok) {
      setAttendanceMsg({ type: "success", text: "Checked out successfully. Have a good evening!" });
      setAttendancePhoto(null);
    }
  };

  // Toggle activity checkbox
  const toggleActivity = (act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  // Live IoT Verification calculation preview
  const currentMachine = activeMachines.find((m) => m.id === selectedMachineId) || activeMachines[0];
  const ratedCapacity = currentMachine?.ratedCapacityKgHr || 25;
  const numQuantity = parseFloat(quantityKg) || 0;
  const numRuntime = parseFloat(runtimeHrs) || 0;

  const liveVerification =
    numQuantity > 0 && numRuntime > 0
      ? verifyReportedQuantity({
          ratedCapacityKgHr: ratedCapacity,
          runtimeHours: numRuntime,
          reportedQuantityKg: numQuantity,
        })
      : null;

  // Handle Work Report Submit
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite || !user) return;
    if (numQuantity <= 0 || numRuntime <= 0) {
      alert("Please enter valid waste processed (kg) and machine runtime (hours).");
      return;
    }

    setIsSubmittingReport(true);
    setReportSuccessMsg(null);

    try {
      const res = await fetch("/api/work-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          siteId: activeSite.id,
          machineId: currentMachine?.id,
          quantityKg: numQuantity,
          machineRuntimeHrs: numRuntime,
          notes: reportNotes || "Daily OWC waste processing completed.",
          voiceTranscript,
          activities: selectedActivities,
          gpsLat: geo.latitude || undefined,
          gpsLong: geo.longitude || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReportSuccessMsg("Work report submitted and IoT verification logged!");
        setQuantityKg("");
        setRuntimeHrs("");
        setReportNotes("");
        setVoiceTranscript("");
      } else {
        alert(json.error?.message || "Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("Submission error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Worker Greeting & Site Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Worker Mobile Operations Portal
            </h1>
            <p className="text-xs text-slate-500">
              Logged in as <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.phone})
            </p>
          </div>
        </div>

        {/* Site Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Assigned Site:</label>
          <select
            value={activeSite?.id || ""}
            onChange={(e) => setActiveSiteId(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-emerald-500 max-w-[220px]"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 1: DIGITAL ATTENDANCE (CHECK-IN / OUT) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Digital Attendance & Photo/GPS Evidence</h2>
          </div>
          {isCheckedIn ? (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
              Checked In ({new Date(activeAttendance!.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 border-slate-300 text-xs">
              Not Checked In
            </Badge>
          )}
        </div>

        {attendanceMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              attendanceMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {attendanceMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{attendanceMsg.text}</span>
          </div>
        )}

        {/* GPS Badge & Geofence Verification */}
        <GpsBadge
          latitude={geo.latitude}
          longitude={geo.longitude}
          accuracy={geo.accuracy}
          siteName={activeSite?.name}
          distanceMeters={distanceToSite}
          isWithinGeofence={isWithinPerimeter}
          loading={geo.loading}
          error={geo.error}
          onRefresh={geo.refreshLocation}
        />

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {!isCheckedIn ? (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 h-11 text-xs font-semibold shadow-sm"
              onClick={() => setIsCameraOpen(true)}
              disabled={checkInSubmitting}
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Selfie & Check In
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="flex-1 h-11 text-xs font-semibold bg-red-600 hover:bg-red-700 shadow-sm"
              onClick={handleCheckOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Record Check-Out Time
            </Button>
          )}
        </div>
      </div>

      {/* SECTION 2: DAILY WORK REPORT & VOICE-BASED INPUT */}
      <form onSubmit={handleSubmitReport} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Daily Work Report & Waste Quantities</h2>
          </div>
          <span className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</span>
        </div>

        {reportSuccessMsg && (
          <div className="p-3 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reportSuccessMsg}</span>
          </div>
        )}

        {/* Machine & Quantity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select OWC Machine</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 font-medium text-slate-800 focus:outline-emerald-500"
            >
              {activeMachines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.model} (Rated: {m.ratedCapacityKgHr} kg/hr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Waste Processed (kg) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.5"
              placeholder="e.g. 50"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Machine Operating Time (hours) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 2.0 (for 2 hrs) or 0.5 (for 30 min)"
              value={runtimeHrs}
              onChange={(e) => setRuntimeHrs(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Theoretical verification indicator */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
            <span className="text-[11px] text-slate-500">Theoretical Output Check:</span>
            {liveVerification ? (
              <div className="mt-1">
                <DiscrepancyBadge
                  isDiscrepancy={liveVerification.isDiscrepancy}
                  quantityKg={numQuantity}
                  expectedKg={liveVerification.expectedQuantityKg}
                  runtimeHrs={numRuntime}
                  percentageVariance={liveVerification.percentageVariance}
                  discrepancyNotes={liveVerification.supervisorNotes}
                  showDetails={true}
                />
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic mt-0.5">
                Enter quantity and runtime to preview IoT validation
              </span>
            )}
          </div>
        </div>

        {/* Operational Activities Checkbox */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Activities Performed Today</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OWC_OPERATIONAL_ACTIVITIES.map((act) => {
              const active = selectedActivities.includes(act);
              return (
                <button
                  type="button"
                  key={act}
                  onClick={() => toggleActivity(act)}
                  className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {act}
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice-Based Reporting Integration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Voice-to-Text Speech Recognition (Convenience Feature)
          </label>
          <VoiceRecorder
            onTranscriptReady={(transcript) => {
              setVoiceTranscript(transcript);
              setReportNotes((prev) => (prev ? `${prev}\n${transcript}` : transcript));
            }}
          />
        </div>

        {/* Editable Report Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Work Description / Observations (Editable)
          </label>
          <textarea
            rows={3}
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            placeholder="Describe operations, feeding details, compost harvesting, or any issues encountered..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-emerald-500 text-slate-800"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-xs font-semibold shadow-sm"
            disabled={isSubmittingReport}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmittingReport ? "Submitting Work Report..." : "Submit Daily Work Report"}
          </Button>
        </div>
      </form>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCaptured}
      />
    </div>
  );
}
