"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Attendance } from "@/src/types";
import { useAuth } from "./AuthContext";

interface AttendanceContextType {
  activeAttendance: Attendance | null;
  isCheckedIn: boolean;
  history: Attendance[];
  isLoading: boolean;
  checkIn: (data: {
    siteId: string;
    photoUrl: string;
    gpsLat: number;
    gpsLong: number;
    gpsAccuracyMeters?: number;
  }) => Promise<{ success: boolean; data?: Attendance; message?: string }>;
  checkOut: () => Promise<boolean>;
  refreshAttendance: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/attendance?userId=${user.id}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistory(json.data);
        const today = new Date().toISOString().split("T")[0];
        const currentActive = json.data.find(
          (a: Attendance) => a.date === today && a.status === "checked_in"
        );
        setActiveAttendance(currentActive || null);
      }
    } catch (e) {
      console.error("Attendance fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const checkIn = async (data: {
    siteId: string;
    photoUrl: string;
    gpsLat: number;
    gpsLong: number;
    gpsAccuracyMeters?: number;
  }) => {
    if (!user) return { success: false, message: "User not authenticated" };
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...data,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveAttendance(json.data);
        setHistory((prev) => [json.data, ...prev]);
        return { success: true, data: json.data };
      }
      return { success: false, message: json.error?.message || "Check-in failed" };
    } catch (e: any) {
      return { success: false, message: e.message || "Network error" };
    }
  };

  const checkOut = async () => {
    if (!activeAttendance) return false;
    try {
      const res = await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId: activeAttendance.id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveAttendance(null);
        setHistory((prev) =>
          prev.map((a) => (a.id === json.data.id ? json.data : a))
        );
        return true;
      }
      return false;
    } catch (e) {
      console.error("Check-out error:", e);
      return false;
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        activeAttendance,
        isCheckedIn: !!activeAttendance,
        history,
        isLoading,
        checkIn,
        checkOut,
        refreshAttendance: fetchAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
}
