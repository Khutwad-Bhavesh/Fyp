"use client";

import React from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DiscrepancyBadgeProps {
  isDiscrepancy: boolean;
  quantityKg: number;
  expectedKg: number;
  runtimeHrs: number;
  percentageVariance?: number;
  discrepancyNotes?: string;
  showDetails?: boolean;
}

export default function DiscrepancyBadge({
  isDiscrepancy,
  quantityKg,
  expectedKg,
  runtimeHrs,
  percentageVariance,
  discrepancyNotes,
  showDetails = false,
}: DiscrepancyBadgeProps) {
  if (isDiscrepancy) {
    return (
      <div className="space-y-1.5">
        <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold text-[11px] px-2 py-0.5 flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          IoT Discrepancy Flagged {percentageVariance !== undefined && `(+${percentageVariance}%)`}
        </Badge>
        {showDetails && (
          <div className="text-[11px] p-2 rounded-lg bg-red-50 border border-red-200 text-red-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">Validation Mismatch:</span>
            {discrepancyNotes ||
              `Reported ${quantityKg} kg while theoretical output for ${runtimeHrs} hrs runtime is ~${expectedKg} kg.`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-[11px] px-2 py-0.5 flex items-center gap-1 w-fit">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        IoT Output Verified
      </Badge>
      {showDetails && (
        <p className="text-[11px] text-slate-500">
          Consistent: {quantityKg} kg matches machine runtime (~{expectedKg} kg expected).
        </p>
      )}
    </div>
  );
}
