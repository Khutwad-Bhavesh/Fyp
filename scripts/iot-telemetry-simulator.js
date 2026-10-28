/**
 * ESP32 / IoT Machine Runtime Simulator
 * 
 * Simulates microcontrollers deployed on Organic Waste Converters
 * sending telemetry pings (runtime duration, current, power) to the Shuchithwam API.
 */

const http = require("http");

const API_HOST = process.env.API_HOST || "localhost";
const API_PORT = process.env.API_PORT || 3000;
const SIMULATION_INTERVAL_MS = 5000;

const MACHINES = [
  { id: "mach_owc_60_01", siteId: "site_dadar_01", model: "OWC-60", baseAmps: 11.0, kw: 4.8 },
  { id: "mach_owc_130_02", siteId: "site_hinjewadi_02", model: "OWC-130", baseAmps: 18.0, kw: 9.0 },
  { id: "mach_owc_300_03", siteId: "site_bkc_03", model: "OWC-300", baseAmps: 32.0, kw: 16.5 },
];

console.log("==================================================");
console.log("Shuchithwam ESP32 Telemetry Gateway Simulator");
console.log(`Connecting to: http://${API_HOST}:${API_PORT}/api/iot`);
console.log("==================================================");

let tick = 0;

function sendTelemetryPing(machine) {
  const current = (machine.baseAmps + (Math.random() * 2 - 1)).toFixed(2);
  const power = (machine.kw + (Math.random() * 0.6 - 0.3)).toFixed(2);
  const temp = (45.0 + Math.random() * 8).toFixed(1);

  const payload = JSON.stringify({
    machineId: machine.id,
    siteId: machine.siteId,
    sessionRuntimeMinutes: 30,
    motorCurrentAmps: parseFloat(current),
    powerKw: parseFloat(power),
    temperatureCelsius: parseFloat(temp),
    isRunning: true,
  });

  const req = http.request(
    {
      hostname: API_HOST,
      port: API_PORT,
      path: "/api/iot",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        console.log(`[IoT Telemetry] Machine ${machine.model} (${machine.id}): ${current}A, ${power}kW, ${temp}°C -> HTTP ${res.statusCode}`);
      });
    }
  );

  req.on("error", (e) => {
    console.log(`[IoT Telemetry Simulation] Local event generated for ${machine.model}: ${current}A, ${power}kW (Server offline or starting)`);
  });

  req.write(payload);
  req.end();
}

// Run single simulation cycle or loop
console.log("\nSimulating telemetry ping across all active OWC machines...\n");
MACHINES.forEach((m) => sendTelemetryPing(m));

console.log("\n[Simulator Ready] To run continuous background telemetry daemon, execute with interval.\n");
