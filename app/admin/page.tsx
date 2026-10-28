"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useSite } from "@/src/context/SiteContext";
import { User, Site, Machine } from "@/src/types";
import { OWC_MACHINE_MODELS } from "@/src/config/constants";
import {
  ShieldCheck,
  Building2,
  Cpu,
  Users,
  Plus,
  Scale,
  Calendar,
  AlertTriangle,
  Download,
  CheckCircle2,
  Edit,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ExportModal from "@/components/common/ExportModal";
import IoTTelemetryViewer from "@/components/iot/IoTTelemetryViewer";

export default function AdminConsole() {
  const { user } = useAuth();
  const { sites, refreshSites } = useSite();

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sites" | "machines" | "users" | "telemetry">("overview");

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateSiteModalOpen, setIsCreateSiteModalOpen] = useState(false);
  const [isCreateMachineModalOpen, setIsCreateMachineModalOpen] = useState(false);

  // New site form
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteLocation, setNewSiteLocation] = useState("");
  const [newSiteLat, setNewSiteLat] = useState("19.0760");
  const [newSiteLong, setNewSiteLong] = useState("72.8777");
  const [newSiteSupervisorId, setNewSiteSupervisorId] = useState("");

  // New machine form
  const [newMachineModel, setNewMachineModel] = useState("OWC-60");
  const [newMachineSerial, setNewMachineSerial] = useState("");
  const [newMachineSiteId, setNewMachineSiteId] = useState("");
  const [newMachineRatedCap, setNewMachineRatedCap] = useState("25");

  const loadData = async () => {
    try {
      const [uRes, mRes, aRes] = await Promise.all([
        fetch("/api/auth"),
        fetch("/api/machines"),
        fetch("/api/analytics"),
      ]);
      const [uJson, mJson, aJson] = await Promise.all([
        uRes.json(),
        mRes.json(),
        aRes.json(),
      ]);

      if (uJson.success) setUsers(uJson.data);
      if (mJson.success) setMachines(mJson.data);
      if (aJson.success) setAnalytics(aJson.data);
    } catch (e) {
      console.error("Admin data load error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const supervisors = users.filter((u) => u.role === "supervisor");

  // Create Site Submit
  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteLocation) return;
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSiteName,
          location: newSiteLocation,
          latitude: parseFloat(newSiteLat),
          longitude: parseFloat(newSiteLong),
          supervisorId: newSiteSupervisorId || (supervisors[0]?.id || "usr_sup_01"),
        }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshSites();
        setIsCreateSiteModalOpen(false);
        setNewSiteName("");
        setNewSiteLocation("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Machine Submit
  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineSerial || !newMachineSiteId) return;
    try {
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: newMachineModel,
          serialNumber: newMachineSerial,
          siteId: newMachineSiteId,
          ratedCapacityKgHr: parseFloat(newMachineRatedCap),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMachines((prev) => [json.data, ...prev]);
        setIsCreateMachineModalOpen(false);
        setNewMachineSerial("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Administrator System Command Console
            </h1>
            <p className="text-xs text-slate-500">
              Rajeshree Enviro Solutions &bull; Multi-Site OWC Infrastructure & Workforce Governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-9 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Company-Wide Report Export
          </Button>

          <Button
            size="sm"
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsCreateSiteModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add OWC Site
          </Button>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Waste Processed</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {analytics?.totalProcessedKg?.toLocaleString() || "295"} kg
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Aggregated across all sites</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active OWC Sites</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{sites.length}</p>
          <span className="text-[11px] text-slate-500">Mumbai & Pune operations</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Discrepancy Flags</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono text-red-600">
            {analytics?.discrepancyCount || "1"}
          </p>
          <span className="text-[11px] text-red-600 font-medium">IoT runtime variance flagged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Field Workforce</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {users.length} Users
          </p>
          <span className="text-[11px] text-slate-500">Workers & Supervisors</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab("sites")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "sites"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          OWC Sites ({sites.length})
        </button>
        <button
          onClick={() => setActiveTab("machines")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "machines"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          OWC Machines ({machines.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Users & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "telemetry"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Live IoT Telemetry
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site Status List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>Operational Sites Status</span>
              <Button size="sm" variant="ghost" onClick={() => setActiveTab("sites")} className="text-xs text-emerald-600">
                Manage All
              </Button>
            </h3>
            <div className="divide-y divide-slate-100">
              {sites.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <p className="text-slate-500 text-[11px]">{s.location}</p>
                    <span className="text-[10px] text-slate-400">Supervisor: {s.supervisorName}</span>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`text-[10px] uppercase font-bold ${
                        s.monthlyVisitStatus === "overdue"
                          ? "bg-red-100 text-red-800"
                          : s.monthlyVisitStatus === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {s.monthlyVisitStatus || "Active"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theoretical IoT Verification Engine Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>IoT Runtime Verification Architecture</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-mono text-emerald-800 font-semibold">
                Expected quantity = Rated processing capacity &times; Machine operating time
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Theoretical throughput logic cross-checks worker-reported batch kilograms against recorded ESP32 microcontroller operational runtime hours.
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-[11px]">
                <strong>Case Example:</strong> OWC-60 rated at 25 kg/hr running for 0.5 hours yields an expected ~12.5 kg. A reported claim of 100 kg is flagged for supervisor physical review.
              </div>
            </div>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("telemetry")}
                className="w-full text-xs text-slate-700"
              >
                Inspect Controller Telemetry & Sensor Readings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITES MANAGEMENT */}
      {activeTab === "sites" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">OWC Operational Sites Registry</h3>
              <p className="text-xs text-slate-500">Configure client locations, geo-coordinates, and assigned supervisors</p>
            </div>
            <Button
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsCreateSiteModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Site
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Site Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">GPS Coordinates</th>
                  <th className="px-4 py-3">Supervisor</th>
                  <th className="px-4 py-3">Machines</th>
                  <th className="px-4 py-3">Visit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sites.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.location}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                      {s.latitude.toFixed(4)}°, {s.longitude.toFixed(4)}°
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{s.supervisorName}</td>
                    <td className="px-4 py-3 font-mono">{s.machinesCount || 1}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] uppercase ${
                          s.monthlyVisitStatus === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {s.monthlyVisitStatus || "Active"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MACHINES MANAGEMENT */}
      {activeTab === "machines" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">OWC Machine Asset Inventory</h3>
              <p className="text-xs text-slate-500">Rated capacities (kg/hr), serial numbers, and cumulative IoT runtime</p>
            </div>
            <Button
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsCreateMachineModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Register Machine
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Serial Number</th>
                  <th className="px-4 py-3">Assigned Site</th>
                  <th className="px-4 py-3">Rated Capacity</th>
                  <th className="px-4 py-3">Total Runtime</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {machines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{m.model}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{m.serialNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{m.siteName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{m.ratedCapacityKgHr} kg/hr</td>
                    <td className="px-4 py-3 font-mono text-emerald-700">{m.totalRuntimeHrs} hrs</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] capitalize">
                        {m.currentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">User Accounts & Role Permissions</h3>
            <p className="text-xs text-slate-500">Role-based access for Administrators, Supervisors, and Workers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{u.name}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          u.role === "admin"
                            ? "bg-emerald-100 text-emerald-800"
                            : u.role === "supervisor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{u.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-700 font-semibold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: IOT TELEMETRY */}
      {activeTab === "telemetry" && (
        <IoTTelemetryViewer machines={machines} />
      )}

      {/* Export Modal */}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* Create Site Modal */}
      {isCreateSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add New OWC Operational Site</h3>
              <button onClick={() => setIsCreateSiteModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateSite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site Name</label>
                <Input
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="e.g. Vashi Industrial OWC Plant"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Location Address</label>
                <Input
                  value={newSiteLocation}
                  onChange={(e) => setNewSiteLocation(e.target.value)}
                  placeholder="e.g. Sector 19, Vashi, Navi Mumbai 400703"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <Input value={newSiteLat} onChange={(e) => setNewSiteLat(e.target.value)} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <Input value={newSiteLong} onChange={(e) => setNewSiteLong(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Supervisor</label>
                <select
                  value={newSiteSupervisorId}
                  onChange={(e) => setNewSiteSupervisorId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                >
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                Save & Initialize Site
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Create Machine Modal */}
      {isCreateMachineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Register OWC Machine</h3>
              <button onClick={() => setIsCreateMachineModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateMachine} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Model</label>
                <select
                  value={newMachineModel}
                  onChange={(e) => {
                    setNewMachineModel(e.target.value);
                    const found = OWC_MACHINE_MODELS.find((m) => m.model === e.target.value);
                    if (found) setNewMachineRatedCap(found.ratedCapacityKgHr.toString());
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200"
                >
                  {OWC_MACHINE_MODELS.map((m) => (
                    <option key={m.model} value={m.model}>
                      {m.model} (Rated: {m.ratedCapacityKgHr} kg/hr)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Serial Number / Hardware ID</label>
                <Input
                  value={newMachineSerial}
                  onChange={(e) => setNewMachineSerial(e.target.value)}
                  placeholder="e.g. RES-OWC60-2026-005"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rated Capacity (kg/hr)</label>
                <Input
                  type="number"
                  value={newMachineRatedCap}
                  onChange={(e) => setNewMachineRatedCap(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Site</label>
                <select
                  value={newMachineSiteId}
                  onChange={(e) => setNewMachineSiteId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                  required
                >
                  <option value="">Select Site...</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9">
                Register Machine
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
