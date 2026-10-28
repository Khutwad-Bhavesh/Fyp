/**
 * Shuchithwam Central Data Store & Repository Layer
 * 
 * Provides an isolated data abstraction supporting in-memory caching,
 * resilient transactional operations, and seamless integration with SQL/Supabase.
 */

import {
  User,
  Site,
  Machine,
  Attendance,
  WorkReport,
  SupervisorVisit,
  IoTTelemetry,
} from "../../types";
import {
  initialUsers,
  initialSites,
  initialMachines,
  initialAttendance,
  initialWorkReports,
  initialVisits,
  initialTelemetry,
} from "./seedData";
import { verifyReportedQuantity } from "../iot/verification";
import { isWithinGeofence } from "../utils/geo";
import { NotFoundError, ValidationError } from "../errors";

class DataStore {
  private users: Map<string, User> = new Map();
  private sites: Map<string, Site> = new Map();
  private machines: Map<string, Machine> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private workReports: Map<string, WorkReport> = new Map();
  private visits: Map<string, SupervisorVisit> = new Map();
  private telemetry: IoTTelemetry[] = [];

  constructor() {
    this.seed();
  }

  public seed(): void {
    initialUsers.forEach((u) => this.users.set(u.id, { ...u }));
    initialSites.forEach((s) => this.sites.set(s.id, { ...s }));
    initialMachines.forEach((m) => this.machines.set(m.id, { ...m }));
    initialAttendance.forEach((a) => this.attendance.set(a.id, { ...a }));
    initialWorkReports.forEach((r) => this.workReports.set(r.id, { ...r }));
    initialVisits.forEach((v) => this.visits.set(v.id, { ...v }));
    this.telemetry = [...initialTelemetry];
  }

  public reset(): void {
    this.users.clear();
    this.sites.clear();
    this.machines.clear();
    this.attendance.clear();
    this.workReports.clear();
    this.visits.clear();
    this.telemetry = [];
    this.seed();
  }

  // ================= USERS =================
  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public createUser(userData: Omit<User, "id" | "createdAt">): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const user = this.users.get(id);
    if (!user) throw new NotFoundError("User", id);
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // ================= SITES =================
  public getSites(): Site[] {
    const sites = Array.from(this.sites.values());
    // Enrich with dynamic statistics
    return sites.map((site) => {
      const supervisor = this.users.get(site.supervisorId);
      const siteMachines = this.getMachinesBySite(site.id);
      const siteWorkers = Array.from(this.users.values()).filter(
        (u) => u.assignedSiteId === site.id && u.role === "worker"
      );
      return {
        ...site,
        supervisorName: supervisor?.name || site.supervisorName || "Unassigned",
        machinesCount: siteMachines.length,
        activeWorkersCount: siteWorkers.length,
      };
    });
  }

  public getSiteById(id: string): Site | undefined {
    const site = this.sites.get(id);
    if (!site) return undefined;
    const supervisor = this.users.get(site.supervisorId);
    return {
      ...site,
      supervisorName: supervisor?.name || site.supervisorName,
    };
  }

  public createSite(siteData: Omit<Site, "id" | "createdAt">): Site {
    const id = `site_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const supervisor = this.users.get(siteData.supervisorId);
    const newSite: Site = {
      id,
      ...siteData,
      supervisorName: supervisor?.name,
      createdAt: new Date().toISOString(),
    };
    this.sites.set(id, newSite);
    return newSite;
  }

  public updateSite(id: string, updates: Partial<Site>): Site {
    const site = this.sites.get(id);
    if (!site) throw new NotFoundError("Site", id);
    const updated = { ...site, ...updates };
    if (updates.supervisorId) {
      const sup = this.users.get(updates.supervisorId);
      if (sup) updated.supervisorName = sup.name;
    }
    this.sites.set(id, updated);
    return updated;
  }

  // ================= MACHINES =================
  public getMachines(): Machine[] {
    return Array.from(this.machines.values()).map((m) => {
      const site = this.sites.get(m.siteId);
      return { ...m, siteName: site?.name || m.siteName };
    });
  }

  public getMachinesBySite(siteId: string): Machine[] {
    return this.getMachines().filter((m) => m.siteId === siteId);
  }

  public getMachineById(id: string): Machine | undefined {
    const machine = this.machines.get(id);
    if (!machine) return undefined;
    const site = this.sites.get(machine.siteId);
    return { ...machine, siteName: site?.name };
  }

  public createMachine(machineData: Omit<Machine, "id" | "createdAt" | "totalRuntimeHrs">): Machine {
    const id = `mach_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const site = this.sites.get(machineData.siteId);
    const newMachine: Machine = {
      id,
      ...machineData,
      siteName: site?.name,
      totalRuntimeHrs: 0,
      createdAt: new Date().toISOString(),
    };
    this.machines.set(id, newMachine);
    return newMachine;
  }

  public updateMachine(id: string, updates: Partial<Machine>): Machine {
    const machine = this.machines.get(id);
    if (!machine) throw new NotFoundError("Machine", id);
    const updated = { ...machine, ...updates };
    this.machines.set(id, updated);
    return updated;
  }

  // ================= ATTENDANCE =================
  public getAttendance(filter?: { siteId?: string; userId?: string; date?: string }): Attendance[] {
    let list = Array.from(this.attendance.values()).sort(
      (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );

    if (filter?.siteId) list = list.filter((a) => a.siteId === filter.siteId);
    if (filter?.userId) list = list.filter((a) => a.userId === filter.userId);
    if (filter?.date) list = list.filter((a) => a.date === filter.date);

    return list.map((a) => {
      const user = this.users.get(a.userId);
      const site = this.sites.get(a.siteId);
      return {
        ...a,
        userName: user?.name || a.userName,
        userRole: user?.role,
        siteName: site?.name || a.siteName,
      };
    });
  }

  public recordCheckIn(input: {
    userId: string;
    siteId: string;
    photoUrl: string;
    gpsLat: number;
    gpsLong: number;
    gpsAccuracyMeters?: number;
  }): Attendance {
    const user = this.users.get(input.userId);
    if (!user) throw new NotFoundError("User", input.userId);
    const site = this.sites.get(input.siteId);
    if (!site) throw new NotFoundError("Site", input.siteId);

    // Geofencing verification
    const geoCheck = isWithinGeofence(
      { latitude: input.gpsLat, longitude: input.gpsLong },
      { latitude: site.latitude, longitude: site.longitude },
      500 // 500m allowable site perimeter
    );

    const todayDate = new Date().toISOString().split("T")[0];
    const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newAttendance: Attendance = {
      id,
      userId: input.userId,
      userName: user.name,
      userRole: user.role,
      siteId: input.siteId,
      siteName: site.name,
      checkInTime: new Date().toISOString(),
      photoUrl: input.photoUrl,
      gpsLat: input.gpsLat,
      gpsLong: input.gpsLong,
      gpsAccuracyMeters: input.gpsAccuracyMeters || 10,
      distanceFromSiteMeters: geoCheck.distanceMeters,
      isWithinGeofence: geoCheck.withinGeofence,
      status: "checked_in",
      date: todayDate,
    };

    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  public recordCheckOut(attendanceId: string): Attendance {
    const record = this.attendance.get(attendanceId);
    if (!record) throw new NotFoundError("Attendance record", attendanceId);

    const updated: Attendance = {
      ...record,
      checkOutTime: new Date().toISOString(),
      status: "checked_out",
    };
    this.attendance.set(attendanceId, updated);
    return updated;
  }

  // ================= WORK REPORTS & IOT VERIFICATION =================
  public getWorkReports(filter?: { siteId?: string; userId?: string; discrepancyOnly?: boolean }): WorkReport[] {
    let list = Array.from(this.workReports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filter?.siteId) list = list.filter((r) => r.siteId === filter.siteId);
    if (filter?.userId) list = list.filter((r) => r.userId === filter.userId);
    if (filter?.discrepancyOnly) list = list.filter((r) => r.discrepancyFlag);

    return list.map((r) => {
      const user = this.users.get(r.userId);
      const site = this.sites.get(r.siteId);
      const machine = r.machineId ? this.machines.get(r.machineId) : undefined;
      return {
        ...r,
        userName: user?.name || r.userName,
        siteName: site?.name || r.siteName,
        machineModel: machine ? `${machine.model} (${machine.ratedCapacityKgHr} kg/hr)` : r.machineModel,
      };
    });
  }

  public createWorkReport(input: {
    userId: string;
    siteId: string;
    machineId?: string;
    quantityKg: number;
    machineRuntimeHrs: number;
    notes: string;
    voiceTranscript?: string;
    activities: string[];
    photoUrl?: string;
    gpsLat?: number;
    gpsLong?: number;
  }): WorkReport {
    const user = this.users.get(input.userId);
    if (!user) throw new NotFoundError("User", input.userId);
    const site = this.sites.get(input.siteId);
    if (!site) throw new NotFoundError("Site", input.siteId);

    // Fetch machine rated capacity for verification
    let ratedCapacity = 25; // default fallback 25 kg/hr
    let machineObj: Machine | undefined;
    if (input.machineId) {
      machineObj = this.machines.get(input.machineId);
      if (machineObj) ratedCapacity = machineObj.ratedCapacityKgHr;
    } else {
      const siteMachines = this.getMachinesBySite(input.siteId);
      if (siteMachines.length > 0) {
        machineObj = siteMachines[0];
        ratedCapacity = machineObj.ratedCapacityKgHr;
      }
    }

    // Run IoT Verification Logic
    const verification = verifyReportedQuantity({
      ratedCapacityKgHr: ratedCapacity,
      runtimeHours: input.machineRuntimeHrs,
      reportedQuantityKg: input.quantityKg,
      tolerancePercentage: 25,
    });

    // Update cumulative machine runtime if machine linked
    if (machineObj && input.machineRuntimeHrs > 0) {
      machineObj.totalRuntimeHrs = Math.round((machineObj.totalRuntimeHrs + input.machineRuntimeHrs) * 10) / 10;
      machineObj.currentStatus = "operational";
      this.machines.set(machineObj.id, machineObj);
    }

    const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const today = new Date().toISOString().split("T")[0];

    const report: WorkReport = {
      id,
      userId: input.userId,
      userName: user.name,
      siteId: input.siteId,
      siteName: site.name,
      machineId: machineObj?.id,
      machineModel: machineObj ? `${machineObj.model} (${machineObj.ratedCapacityKgHr} kg/hr)` : undefined,
      reportDate: today,
      quantityKg: input.quantityKg,
      machineRuntimeHrs: input.machineRuntimeHrs,
      expectedQuantityKg: verification.expectedQuantityKg,
      discrepancyFlag: verification.isDiscrepancy,
      discrepancyPercentage: verification.percentageVariance,
      discrepancyNotes: verification.isDiscrepancy ? verification.supervisorNotes : undefined,
      notes: input.notes,
      voiceTranscript: input.voiceTranscript,
      activities: input.activities || [],
      photoUrl: input.photoUrl,
      gpsLat: input.gpsLat,
      gpsLong: input.gpsLong,
      status: verification.isDiscrepancy ? "flagged" : "submitted",
      createdAt: new Date().toISOString(),
    };

    this.workReports.set(id, report);
    return report;
  }

  public updateReportStatus(
    reportId: string,
    status: "verified" | "flagged",
    reviewerId: string,
    reviewerNotes?: string
  ): WorkReport {
    const report = this.workReports.get(reportId);
    if (!report) throw new NotFoundError("Work report", reportId);

    const updated: WorkReport = {
      ...report,
      status,
      reviewerId,
      reviewerNotes,
    };
    this.workReports.set(reportId, updated);
    return updated;
  }

  // ================= SUPERVISOR VISITS =================
  public getVisits(filter?: { supervisorId?: string; siteId?: string }): SupervisorVisit[] {
    let list = Array.from(this.visits.values()).sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );

    if (filter?.supervisorId) list = list.filter((v) => v.supervisorId === filter.supervisorId);
    if (filter?.siteId) list = list.filter((v) => v.siteId === filter.siteId);

    return list.map((v) => {
      const site = this.sites.get(v.siteId);
      const sup = this.users.get(v.supervisorId);
      return {
        ...v,
        siteName: site?.name || v.siteName,
        supervisorName: sup?.name || v.supervisorName,
      };
    });
  }

  public scheduleVisit(input: {
    siteId: string;
    supervisorId: string;
    scheduledDate: string;
    observations?: string;
  }): SupervisorVisit {
    const site = this.sites.get(input.siteId);
    if (!site) throw new NotFoundError("Site", input.siteId);
    const supervisor = this.users.get(input.supervisorId);
    if (!supervisor) throw new NotFoundError("Supervisor", input.supervisorId);

    const id = `vst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newVisit: SupervisorVisit = {
      id,
      siteId: input.siteId,
      siteName: site.name,
      supervisorId: input.supervisorId,
      supervisorName: supervisor.name,
      scheduledDate: input.scheduledDate,
      status: "scheduled",
      observations: input.observations,
      createdAt: new Date().toISOString(),
    };

    this.visits.set(id, newVisit);
    return newVisit;
  }

  public completeVisit(visitId: string, input: {
    observations: string;
    checklist?: SupervisorVisit["checklist"];
    evidencePhotoUrl?: string;
  }): SupervisorVisit {
    const visit = this.visits.get(visitId);
    if (!visit) throw new NotFoundError("Visit", visitId);

    const updated: SupervisorVisit = {
      ...visit,
      status: "completed",
      visitDate: new Date().toISOString(),
      observations: input.observations,
      checklist: input.checklist,
      evidencePhotoUrl: input.evidencePhotoUrl,
    };
    this.visits.set(visitId, updated);

    // Update site's last visited date
    const site = this.sites.get(visit.siteId);
    if (site) {
      site.lastVisitedDate = new Date().toISOString().split("T")[0];
      site.monthlyVisitStatus = "completed";
      this.sites.set(site.id, site);
    }

    return updated;
  }

  // ================= IOT TELEMETRY =================
  public getTelemetry(machineId?: string): IoTTelemetry[] {
    if (machineId) {
      return this.telemetry.filter((t) => t.machineId === machineId);
    }
    return this.telemetry;
  }

  public recordTelemetry(input: Omit<IoTTelemetry, "id">): IoTTelemetry {
    const id = `tel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const entry: IoTTelemetry = { id, ...input };
    this.telemetry.unshift(entry);
    // Keep max 100 recent entries
    if (this.telemetry.length > 100) this.telemetry.pop();

    // Update machine state
    const machine = this.machines.get(input.machineId);
    if (machine) {
      machine.currentStatus = input.isRunning ? "running" : "operational";
      machine.lastTelemetryTimestamp = input.timestamp;
      this.machines.set(machine.id, machine);
    }

    return entry;
  }

  // ================= SYSTEM ANALYTICS =================
  public getSystemAnalytics() {
    const reports = Array.from(this.workReports.values());
    const totalProcessedKg = reports.reduce((sum, r) => sum + r.quantityKg, 0);
    const totalExpectedKg = reports.reduce((sum, r) => sum + r.expectedQuantityKg, 0);
    const discrepancyCount = reports.filter((r) => r.discrepancyFlag).length;
    const totalActiveSites = Array.from(this.sites.values()).filter((s) => s.status === "active").length;
    const totalWorkers = Array.from(this.users.values()).filter((u) => u.role === "worker").length;
    const totalSupervisors = Array.from(this.users.values()).filter((u) => u.role === "supervisor").length;
    const totalMachines = this.machines.size;
    const overdueVisits = Array.from(this.visits.values()).filter((v) => v.status === "overdue").length;

    return {
      totalProcessedKg: Math.round(totalProcessedKg),
      totalExpectedKg: Math.round(totalExpectedKg),
      discrepancyCount,
      totalActiveSites,
      totalWorkers,
      totalSupervisors,
      totalMachines,
      overdueVisits,
      recentReports: this.getWorkReports().slice(0, 5),
    };
  }
}

// Global Singleton Instance
export const dbStore = new DataStore();
export default dbStore;
