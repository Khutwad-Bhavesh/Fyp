"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/src/types";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (roleOrEmail: string) => Promise<boolean>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  availableUsers: User[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch available demo users from API
    async function initUsers() {
      try {
        const res = await fetch("/api/auth");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAvailableUsers(json.data);
          // Check localStorage or default to worker
          const savedUserId = localStorage.getItem("shuchithwam_active_user");
          const found = savedUserId ? json.data.find((u: User) => u.id === savedUserId) : null;
          setUser(found || json.data.find((u: User) => u.role === "worker") || json.data[0]);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    initUsers();
  }, []);

  const login = async (roleOrEmail: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const isRole = ["admin", "supervisor", "worker"].includes(roleOrEmail.toLowerCase());
      const body = isRole ? { role: roleOrEmail.toLowerCase() } : { email: roleOrEmail };
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
        localStorage.setItem("shuchithwam_active_user", json.data.user.id);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("shuchithwam_active_user");
  };

  const switchUserRole = (targetRole: UserRole) => {
    const targetUser = availableUsers.find((u) => u.role === targetRole);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem("shuchithwam_active_user", targetUser.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "worker",
        isAuthenticated: !!user,
        login,
        logout,
        switchUserRole,
        availableUsers,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
