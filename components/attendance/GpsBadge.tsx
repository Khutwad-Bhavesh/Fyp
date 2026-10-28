"use client";

import React from "react";
import { MapPin, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GpsBadgeProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  siteLatitude?: number;
  siteLongitude?: number;
  siteName?: string;
  distanceMeters?: number | null;
  isWithinGeofence?: boolean;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function GpsBadge({
  latitude,
  longitude,
  accuracy,
  siteName,
  distanceMeters,
  isWithinGeofence = true,
  loading = false,
  error = null,
  onRefresh,
}: GpsBadgeProps) {
  if (error) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="p-1 hover:bg-amber-100 rounded text-amber-700">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-800">GPS Site Verification</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
        <div>
          <span className="text-slate-400 block">Coordinates:</span>
          {latitude && longitude ? (
            <span className="font-mono text-slate-700">
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </span>
          ) : (
            <span className="text-slate-400 italic">Acquiring satellite lock...</span>
          )}
        </div>
        <div>
          <span className="text-slate-400 block">GPS Accuracy:</span>
          <span className="font-mono text-slate-700">±{accuracy ?? 10} meters</span>
        </div>
      </div>

      {distanceMeters !== undefined && distanceMeters !== null && (
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500">Distance from {siteName || "Site"}:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">{distanceMeters}m</span>
            {isWithinGeofence ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] py-0">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> On Site
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] py-0">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> &gt; 500m Away
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
