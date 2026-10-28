"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useNotifications } from "@/src/context/NotificationContext";
import { UserRole } from "@/src/types";
import {
  Bell,
  HardHat,
  ShieldCheck,
  UserCheck,
  Building2,
  Cpu,
  ChevronDown,
  LogOut,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const pathname = usePathname();
  const { user, role, switchUserRole, logout } = useAuth();
  const { alerts, unreadCount, overdueVisitsCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case "admin":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "supervisor":
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case "worker":
        return <HardHat className="w-4 h-4 text-amber-600" />;
    }
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case "admin":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "supervisor":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "worker":
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  Shuchithwam
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">
                    Smart OWC
                  </span>
                </span>
                <p className="text-xs text-slate-500 font-medium">Rajeshree Enviro Solutions</p>
              </div>
            </Link>
          </div>

          {/* Navigation Role Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <Link href="/worker">
              <button
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname.startsWith("/worker")
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                Worker Portal
              </button>
            </Link>
            <Link href="/supervisor">
              <button
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                  pathname.startsWith("/supervisor")
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Supervisor Dashboard
                {overdueVisitsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </button>
            </Link>
            <Link href="/admin">
              <button
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Admin Console
              </button>
            </Link>
          </nav>

          {/* User Controls & Notifications */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-800">
                      Alerts & Reminders ({unreadCount})
                    </span>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-600 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-500">No active alerts</p>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 text-xs flex gap-2.5 ${
                            alert.read ? "opacity-60 bg-white" : "bg-emerald-50/40"
                          }`}
                        >
                          {alert.severity === "error" ? (
                            <Calendar className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{alert.title}</p>
                            <p className="text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {alert.date}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${getRoleBadgeColor(
                  role
                )}`}
              >
                {getRoleIcon(role)}
                <span className="capitalize">{role} Mode</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role (Demo)
                    </p>
                    <p className="text-xs font-medium text-slate-700 truncate">{user?.name}</p>
                  </div>
                  {(["worker", "supervisor", "admin"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchUserRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                        role === r ? "bg-slate-100 font-bold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {getRoleIcon(r)}
                      <span className="capitalize">{r} Portal</span>
                      {role === r && <span className="ml-auto text-[10px] text-emerald-600">Active</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
