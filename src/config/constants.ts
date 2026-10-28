/**
 * Shuchithwam Domain Constants
 * Aligned with Rajeshree Enviro Solutions OWC operations synopsis
 */

export const USER_ROLES = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  WORKER: "worker",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const OWC_OPERATIONAL_ACTIVITIES = [
  "Waste Segregation & Sorting",
  "Organic Waste Feeding",
  "Shredding Process",
  "Bio-culture & Moisture Addition",
  "OWC Curing & Aeration",
  "Compost Harvesting & Bagging",
  "Machine Cleaning & Sanitization",
  "Periodic Maintenance Check",
] as const;

export const OWC_MACHINE_MODELS = [
  { model: "OWC-30", ratedCapacityKgHr: 15, batchCapacityKg: 30 },
  { model: "OWC-60", ratedCapacityKgHr: 25, batchCapacityKg: 60 },
  { model: "OWC-130", ratedCapacityKgHr: 50, batchCapacityKg: 130 },
  { model: "OWC-300", ratedCapacityKgHr: 100, batchCapacityKg: 300 },
  { model: "OWC-500", ratedCapacityKgHr: 160, batchCapacityKg: 500 },
] as const;

export const ATTENDANCE_STATUS = {
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
} as const;

export const REPORT_STATUS = {
  SUBMITTED: "submitted",
  VERIFIED: "verified",
  FLAGGED: "flagged",
} as const;

export const VISIT_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

export const VISIT_FREQUENCY_DAYS = 30; // 1 visit per month per assigned site
