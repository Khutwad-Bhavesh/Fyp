/**
 * Shuchithwam TypeScript Data Model Definitions
 * Strictly aligned with the Synopsis ER Diagram and operational requirements
 */

export type UserRole = "admin" | "supervisor" | "worker";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  assignedSiteId?: string;
  avatarUrl?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  supervisorId: string;
  supervisorName?: string;
  status: "active" | "inactive";
  machinesCount?: number;
  activeWorkersCount?: number;
  monthlyVisitStatus?: "completed" | "scheduled" | "overdue";
  lastVisitedDate?: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  siteId: string;
  siteName?: string;
  model: string;
  serialNumber: string;
  ratedCapacityKgHr: number; // kg per hour
  totalRuntimeHrs: number;   // Cumulative IoT runtime hours
  currentStatus: "operational" | "running" | "idle" | "maintenance" | "offline";
  lastTelemetryTimestamp?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  userName?: string;
  userRole?: UserRole;
  siteId: string;
  siteName?: string;
  checkInTime: string;
  checkOutTime?: string;
  photoUrl: string; // Base64 or URL
  gpsLat: number;
  gpsLong: number;
  gpsAccuracyMeters?: number;
  distanceFromSiteMeters?: number;
  isWithinGeofence: boolean;
  status: "checked_in" | "checked_out";
  date: string;
}

export interface WorkReport {
  id: string;
  userId: string;
  userName?: string;
  siteId: string;
  siteName?: string;
  machineId?: string;
  machineModel?: string;
  reportDate: string;
  quantityKg: number;              // Reported waste processed in kg
  machineRuntimeHrs: number;       // Reported or IoT runtime hours
  expectedQuantityKg: number;      // Calculated: Rated capacity * runtime
  discrepancyFlag: boolean;        // True if discrepancy detected
  discrepancyPercentage?: number;
  discrepancyNotes?: string;
  notes: string;                   // Text notes
  voiceTranscript?: string;        // Speech-to-text transcript
  activities: string[];            // Selected OWC operations
  photoUrl?: string;               // Optional photo evidence
  gpsLat?: number;
  gpsLong?: number;
  status: "submitted" | "verified" | "flagged";
  reviewerId?: string;
  reviewerNotes?: string;
  createdAt: string;
}

export interface SupervisorVisit {
  id: string;
  siteId: string;
  siteName?: string;
  supervisorId: string;
  supervisorName?: string;
  scheduledDate: string;
  visitDate?: string;
  status: "scheduled" | "completed" | "overdue";
  observations?: string;
  checklist?: {
    machineCondition: "good" | "fair" | "needs_repair";
    workerHygieneCompliance: boolean;
    wasteSegregationQuality: "high" | "moderate" | "poor";
    logbookMatch: boolean;
    curingBayStatus: "optimal" | "overflowing" | "normal";
  };
  evidencePhotoUrl?: string;
  createdAt: string;
}

export interface IoTTelemetry {
  id: string;
  machineId: string;
  siteId: string;
  timestamp: string;
  sessionRuntimeMinutes: number;
  motorCurrentAmps: number;
  powerKw: number;
  temperatureCelsius?: number;
  isRunning: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    timestamp: string;
  };
}
