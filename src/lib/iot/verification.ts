/**
 * IoT Verification Engine for OWC Machines
 * 
 * Implements the theoretical comparison defined in the Rajeshree Enviro Solutions Synopsis:
 * Expected quantity = Rated processing capacity (kg/hr) * Machine operating time (hours)
 * 
 * Rationale:
 * Runtime data serves as an operational indicator to assist supervisors in flagging
 * unlikely or anomalous waste reporting figures for physical site review.
 */

export interface VerificationInput {
  ratedCapacityKgHr: number;
  runtimeHours: number;
  reportedQuantityKg: number;
  tolerancePercentage?: number; // e.g., 25% margin of variation
}

export interface VerificationResult {
  expectedQuantityKg: number;
  reportedQuantityKg: number;
  differenceKg: number;
  percentageVariance: number;
  isDiscrepancy: boolean;
  statusText: string;
  supervisorNotes: string;
}

/**
 * Calculates expected waste processed and evaluates discrepancy
 */
export function verifyReportedQuantity(input: VerificationInput): VerificationResult {
  const {
    ratedCapacityKgHr,
    runtimeHours,
    reportedQuantityKg,
    tolerancePercentage = 25,
  } = input;

  if (ratedCapacityKgHr <= 0) {
    throw new Error("Rated capacity must be greater than zero");
  }

  // Handle zero or minimal runtime
  if (runtimeHours <= 0) {
    const isDiscrepancy = reportedQuantityKg > 0;
    return {
      expectedQuantityKg: 0,
      reportedQuantityKg,
      differenceKg: reportedQuantityKg,
      percentageVariance: reportedQuantityKg > 0 ? 100 : 0,
      isDiscrepancy,
      statusText: isDiscrepancy ? "Discrepancy Flagged" : "Normal",
      supervisorNotes: isDiscrepancy
        ? `Worker reported ${reportedQuantityKg} kg, but machine runtime was recorded as 0 hours.`
        : "No machine run and no waste reported.",
    };
  }

  // Core formula: Expected quantity = Rated processing capacity * Machine operating time
  const expectedQuantity = Math.round(ratedCapacityKgHr * runtimeHours * 10) / 10;
  const difference = Math.round((reportedQuantityKg - expectedQuantity) * 10) / 10;
  
  // Upper allowable threshold considering batch variations and waste densities
  const upperThreshold = expectedQuantity * (1 + tolerancePercentage / 100);
  const lowerThreshold = expectedQuantity * (1 - Math.min(tolerancePercentage, 50) / 100);

  const percentageVariance = Math.round(((reportedQuantityKg - expectedQuantity) / expectedQuantity) * 100);

  // If reported quantity exceeds rated capacity * runtime beyond tolerance
  const isOverReported = reportedQuantityKg > upperThreshold;
  const isSignificantlyUnderReported = reportedQuantityKg < lowerThreshold && reportedQuantityKg > 0;
  const isDiscrepancy = isOverReported;

  let statusText = "Verified Consistent";
  let supervisorNotes = `Reported quantity (${reportedQuantityKg} kg) matches expected machine output (~${expectedQuantity} kg at ${ratedCapacityKgHr} kg/hr for ${runtimeHours} hrs).`;

  if (isOverReported) {
    statusText = "Discrepancy Flagged: Exceeds Capacity";
    supervisorNotes = `Attention: Machine ran for ${runtimeHours} hrs with rated capacity of ${ratedCapacityKgHr} kg/hr (Expected ~${expectedQuantity} kg). Reported ${reportedQuantityKg} kg exceeds theoretical maximum by +${percentageVariance}%. Requires supervisor inspection.`;
  } else if (isSignificantlyUnderReported) {
    statusText = "Low Throughput Detected";
    supervisorNotes = `Notice: Machine ran for ${runtimeHours} hrs, but only ${reportedQuantityKg} kg was processed (Expected ~${expectedQuantity} kg). Check if machine was idling or experiencing feeding delays.`;
  }

  return {
    expectedQuantityKg: expectedQuantity,
    reportedQuantityKg,
    differenceKg: difference,
    percentageVariance,
    isDiscrepancy,
    statusText,
    supervisorNotes,
  };
}
