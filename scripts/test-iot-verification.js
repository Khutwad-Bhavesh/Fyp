/**
 * Unit Test Script for IoT Verification Logic
 * Validates the formula specified in the Rajeshree Enviro Solutions Synopsis:
 * Expected quantity = Rated processing capacity * Machine operating time
 */

const assert = require("assert");

function verifyReportedQuantity({ ratedCapacityKgHr, runtimeHours, reportedQuantityKg, tolerancePercentage = 25 }) {
  if (runtimeHours <= 0) {
    const isDiscrepancy = reportedQuantityKg > 0;
    return {
      expectedQuantityKg: 0,
      reportedQuantityKg,
      isDiscrepancy,
      percentageVariance: reportedQuantityKg > 0 ? 100 : 0,
    };
  }

  const expectedQuantity = Math.round(ratedCapacityKgHr * runtimeHours * 10) / 10;
  const upperThreshold = expectedQuantity * (1 + tolerancePercentage / 100);
  const percentageVariance = Math.round(((reportedQuantityKg - expectedQuantity) / expectedQuantity) * 100);
  const isDiscrepancy = reportedQuantityKg > upperThreshold;

  return {
    expectedQuantityKg: expectedQuantity,
    reportedQuantityKg,
    percentageVariance,
    isDiscrepancy,
  };
}

console.log("=================================================");
console.log("Running Shuchithwam IoT Verification Test Suite");
console.log("=================================================\n");

// TEST CASE 1: Synopsis Example (page 13)
// OWC rated at 25 kg/hr, runs for 30 minutes (0.5 hr).
// Expected: 25 * 0.5 = 12.5 kg.
// Reported: 100 kg.
// Result: Discrepancy Flagged!
console.log("Test Case 1: Synopsis Discrepancy Example (25 kg/hr, 0.5 hr, reported 100 kg)");
const test1 = verifyReportedQuantity({
  ratedCapacityKgHr: 25,
  runtimeHours: 0.5,
  reportedQuantityKg: 100,
});
console.log("  Expected Output:", test1.expectedQuantityKg, "kg");
console.log("  Reported Quantity:", test1.reportedQuantityKg, "kg");
console.log("  Percentage Variance:", `+${test1.percentageVariance}%`);
console.log("  Is Discrepancy Flagged?", test1.isDiscrepancy ? "YES (PASSED)" : "NO (FAILED)");
assert.strictEqual(test1.expectedQuantityKg, 12.5);
assert.strictEqual(test1.isDiscrepancy, true);

// TEST CASE 2: Consistent Report
// OWC rated at 25 kg/hr, runs for 2.0 hrs.
// Expected: 25 * 2.0 = 50 kg.
// Reported: 50 kg.
// Result: Normal Verified.
console.log("\nTest Case 2: Consistent Report (25 kg/hr, 2.0 hrs, reported 50 kg)");
const test2 = verifyReportedQuantity({
  ratedCapacityKgHr: 25,
  runtimeHours: 2.0,
  reportedQuantityKg: 50,
});
console.log("  Expected Output:", test2.expectedQuantityKg, "kg");
console.log("  Reported Quantity:", test2.reportedQuantityKg, "kg");
console.log("  Is Discrepancy Flagged?", test2.isDiscrepancy ? "YES" : "NO (VERIFIED CONSISTENT)");
assert.strictEqual(test2.expectedQuantityKg, 50);
assert.strictEqual(test2.isDiscrepancy, false);

// TEST CASE 3: Within Acceptable 25% Tolerance
// OWC rated at 50 kg/hr, runs for 3.0 hrs (Expected 150 kg).
// Reported: 160 kg (+6.6%).
// Result: Verified within tolerance margin.
console.log("\nTest Case 3: Within Tolerance Margin (50 kg/hr, 3.0 hrs, reported 160 kg)");
const test3 = verifyReportedQuantity({
  ratedCapacityKgHr: 50,
  runtimeHours: 3.0,
  reportedQuantityKg: 160,
});
console.log("  Expected Output:", test3.expectedQuantityKg, "kg");
console.log("  Reported Quantity:", test3.reportedQuantityKg, "kg");
console.log("  Is Discrepancy Flagged?", test3.isDiscrepancy ? "YES" : "NO (PASSED TOLERANCE)");
assert.strictEqual(test3.expectedQuantityKg, 150);
assert.strictEqual(test3.isDiscrepancy, false);

console.log("\n=================================================");
console.log("✅ ALL IOT VERIFICATION TEST CASES PASSED SUCCESSFULLY!");
console.log("=================================================");
