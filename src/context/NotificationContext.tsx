"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupervisorVisit, WorkReport } from "@/src/types";
import { useAuth } from "./AuthContext";

export interface SystemAlert {
  id: string;
  type: "visit_reminder" | "discrepancy" | "system";
  title: string;
  message: string;
  date: string;
  severity: "info" | "warning" | "error";
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  alerts: SystemAlert[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  overdueVisitsCount: number;
  discrepanciesCount: number;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { role, user } = useAuth();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const fetchAlerts = async () => {
    try {
      const newAlerts: SystemAlert[] = [];

      // Fetch visits for reminder alerts
      const visitsRes = await fetch("/api/visits");
      const visitsJson = await visitsRes.json();
      if (visitsJson.success && Array.isArray(visitsJson.data)) {
        visitsJson.data.forEach((v: SupervisorVisit) => {
          if (v.status === "overdue") {
            newAlerts.push({
              id: `alert_vst_${v.id}`,
              type: "visit_reminder",
              title: "Overdue Monthly Site Visit!",
              message: `Inspection for ${v.siteName || "OWC Site"} was scheduled for ${v.scheduledDate} and is currently overdue.`,
              date: v.scheduledDate,
              severity: "error",
              read: false,
              link: "/supervisor",
            });
          } else if (v.status === "scheduled") {
            newAlerts.push({
              id: `alert_vst_${v.id}`,
              type: "visit_reminder",
              title: "Scheduled Monthly Site Visit",
              message: `Upcoming monthly inspection for ${v.siteName} scheduled on ${v.scheduledDate}.`,
              date: v.scheduledDate,
              severity: "info",
              read: false,
              link: "/supervisor",
            });
          }
        });
      }

      // Fetch work reports for IoT discrepancy alerts
      const reportsRes = await fetch("/api/work-reports?discrepancyOnly=true");
      const reportsJson = await reportsRes.json();
      if (reportsJson.success && Array.isArray(reportsJson.data)) {
        reportsJson.data.forEach((r: WorkReport) => {
          newAlerts.push({
            id: `alert_rep_${r.id}`,
            type: "discrepancy",
            title: `IoT Runtime Discrepancy (${r.siteName})`,
            message: r.discrepancyNotes || `Reported ${r.quantityKg} kg with ${r.machineRuntimeHrs} hrs runtime exceeded rated capacity.`,
            date: r.reportDate,
            severity: "warning",
            read: false,
            link: "/supervisor",
          });
        });
      }

      setAlerts(newAlerts);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [role, user]);

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const unreadCount = alerts.filter((a) => !a.read).length;
  const overdueVisitsCount = alerts.filter((a) => a.type === "visit_reminder" && a.severity === "error").length;
  const discrepanciesCount = alerts.filter((a) => a.type === "discrepancy").length;

  return (
    <NotificationContext.Provider
      value={{
        alerts,
        unreadCount,
        markAsRead,
        markAllAsRead,
        overdueVisitsCount,
        discrepanciesCount,
        refreshNotifications: fetchAlerts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
