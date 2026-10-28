"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  HardHat,
  UserCheck,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Calendar,
  Sparkles,
  Mic,
  Camera,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const router = useRouter();
  const { user, switchUserRole } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  const handlePortalAccess = (role: "worker" | "supervisor" | "admin", route: string) => {
    switchUserRole(role);
    router.push(route);
  };

  return (
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs py-1 px-3 backdrop-blur-xs font-semibold">
            Industry Partner: Rajeshree Enviro Solutions
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Smart OWC Operations Monitoring & Management System
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminating handwritten registers through a centralized digital operations platform.
            Empowers field workers with mobile attendance and voice-to-text reporting, while giving
            supervisors verifiable GPS/photo evidence, monthly visit reminders, and IoT machine-runtime
            capacity cross-checks.
          </p>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-10 opacity-10 hidden lg:block pointer-events-none">
          <Cpu className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* Role Portals Selection (Three Roles from Synopsis) */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Select Role Access Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose an operational persona below to test role-based permissions and dedicated workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Worker Portal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Field Worker Portal
                </h3>
                <span className="text-xs text-amber-600 font-semibold">Mobile-First Interface</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for on-site staff. Select assigned OWC site, check in/out with selfie camera &
                geofenced GPS coordinates, and submit daily waste-processing batches via typing or voice
                speech-to-text.
              </p>
              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selfie Camera Attendance</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GPS Geofence Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Speech-to-Text Reporting</span>
                </div>
              </div>
            </div>

            <Button
              className="mt-6 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-10"
              onClick={() => handlePortalAccess("worker", "/worker")}
            >
              Launch Worker Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* 2. Supervisor Portal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Supervisor Dashboard
                </h3>
                <span className="text-xs text-blue-600 font-semibold">Monitoring & Audit Hub</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Site-wise visibility of worker attendance, GPS coordinates, and photo evidence. Automated
                reminders for scheduled monthly site visits and IoT machine runtime discrepancy verification.
              </p>
              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Monthly Site Visit Reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>IoT Runtime Discrepancy Flagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Checklist & Report Sign-Off</span>
                </div>
              </div>
            </div>

            <Button
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10"
              onClick={() => handlePortalAccess("supervisor", "/supervisor")}
            >
              Launch Supervisor Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* 3. Administrator Console */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Administrator Console
                </h3>
                <span className="text-xs text-emerald-600 font-semibold">Central Governance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized control of all OWC operational sites, user accounts, and machine asset capacities.
                Access company-wide analytics, live ESP32 controller telemetry, and operational report exports.
              </p>
              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Site Management & Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Machine Rated Capacities (kg/hr)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Full Audit & PDF/CSV Export</span>
                </div>
              </div>
            </div>

            <Button
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-10"
              onClick={() => handlePortalAccess("admin", "/admin")}
            >
              Launch Admin Console <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* IoT Verification Formula Highlight */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
            Synopsis Verification Logic (Section 3.9 & 8)
          </Badge>
          <h3 className="text-xl font-bold text-slate-900">
            Automated Discrepancy Evaluation via Machine Runtime
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform compares worker-reported waste processing quantities against the machine&apos;s rated
            hourly capacity and recorded ESP32 operating runtime:
          </p>
          <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-sm shadow-inner">
            Expected quantity (kg) = Rated processing capacity (kg/hr) &times; Machine operating time (hrs)
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            For example, if an OWC-60 machine rated at 25 kg/hr runs for 0.5 hours (30 mins), the theoretical
            expected output is ~12.5 kg. If a worker reports 100 kg, the system immediately flags a
            discrepancy for supervisor physical audit.
          </p>
        </div>
      </div>
    </div>
  );
}
