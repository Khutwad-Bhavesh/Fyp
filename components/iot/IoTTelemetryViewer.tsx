"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Zap, Activity, Clock, Play, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IoTTelemetry, Machine } from "@/src/types";

interface IoTTelemetryViewerProps {
  machines: Machine[];
  onTriggerSimulation?: (machineId: string) => void;
}

export default function IoTTelemetryViewer({ machines, onTriggerSimulation }: IoTTelemetryViewerProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || "");
  const [telemetryLogs, setTelemetryLogs] = useState<IoTTelemetry[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (machines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(machines[0].id);
    }
  }, [machines, selectedMachineId]);

  useEffect(() => {
    if (!selectedMachineId) return;

    async function loadTelemetry() {
      try {
        const res = await fetch(`/api/iot?machineId=${selectedMachineId}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTelemetryLogs(json.data);
        }
      } catch (e) {
        console.error("Telemetry fetch error:", e);
      }
    }
    loadTelemetry();
  }, [selectedMachineId]);

  const activeMachine = machines.find((m) => m.id === selectedMachineId);

  const simulatePing = async () => {
    if (!activeMachine) return;
    setIsSimulating(true);
    try {
      const res = await fetch("/api/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: activeMachine.id,
          siteId: activeMachine.siteId,
          sessionRuntimeMinutes: 30,
          motorCurrentAmps: (Math.random() * 4 + 10).toFixed(1),
          powerKw: (Math.random() * 2 + 4.5).toFixed(1),
          temperatureCelsius: (Math.random() * 5 + 46).toFixed(1),
          isRunning: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTelemetryLogs((prev) => [json.data, ...prev]);
        if (onTriggerSimulation) onTriggerSimulation(activeMachine.id);
      }
    } catch (e) {
      console.error("Sim ping failed:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Title & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            IoT Machine Telemetry & Runtime Verification
          </h3>
          <p className="text-xs text-slate-500">Live ESP32 controller operating hours & electrical telemetry</p>
        </div>

        {/* Machine selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-800 focus:outline-emerald-500"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.model} - {m.siteName || m.siteId} ({m.ratedCapacityKgHr} kg/hr)
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={simulatePing}
            disabled={isSimulating}
            className="text-xs h-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            <Play className={`w-3 h-3 mr-1 ${isSimulating ? "animate-spin" : ""}`} />
            Send IoT Ping
          </Button>
        </div>
      </div>

      {/* Machine Stat Tiles */}
      {activeMachine && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Runtime</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{activeMachine.totalRuntimeHrs} hrs</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Rated Capacity</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{activeMachine.ratedCapacityKgHr} kg/hr</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Operating State</span>
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 capitalize ${
                activeMachine.currentStatus === "running"
                  ? "bg-emerald-100 text-emerald-800"
                  : activeMachine.currentStatus === "operational"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {activeMachine.currentStatus}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Cpu className="w-3.5 h-3.5 text-purple-500" />
              <span>Serial / Node</span>
            </div>
            <p className="text-xs font-mono font-medium text-slate-700 mt-1 truncate">{activeMachine.serialNumber}</p>
          </div>
        </div>
      )}

      {/* Telemetry Log Stream */}
      <div>
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Recent ESP32 Telemetry Records</h4>
        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
          {telemetryLogs.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">No telemetry recorded yet</p>
          ) : (
            telemetryLogs.map((log) => (
              <div key={log.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-slate-700 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-slate-600">Session: {log.sessionRuntimeMinutes} min</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
                  <span>{log.motorCurrentAmps}A</span>
                  <span>{log.powerKw}kW</span>
                  {log.temperatureCelsius && <span>{log.temperatureCelsius}°C</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
