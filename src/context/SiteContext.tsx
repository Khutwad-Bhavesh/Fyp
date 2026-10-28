"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Site, Machine } from "@/src/types";

interface SiteContextType {
  sites: Site[];
  activeSite: Site | null;
  activeMachines: Machine[];
  setActiveSiteId: (siteId: string) => void;
  isLoading: boolean;
  refreshSites: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [activeMachines, setActiveMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/sites");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSites(json.data);
        if (!activeSite && json.data.length > 0) {
          setActiveSite(json.data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load sites:", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeSite]);

  const fetchMachines = useCallback(async (siteId: string) => {
    try {
      const res = await fetch(`/api/machines?siteId=${siteId}`);
      const json = await res.json();
      if (json.success) {
        setActiveMachines(json.data);
      }
    } catch (e) {
      console.error("Failed to load machines:", e);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    if (activeSite) {
      fetchMachines(activeSite.id);
    }
  }, [activeSite, fetchMachines]);

  const setActiveSiteId = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      setActiveSite(site);
    }
  };

  return (
    <SiteContext.Provider
      value={{
        sites,
        activeSite,
        activeMachines,
        setActiveSiteId,
        isLoading,
        refreshSites: fetchSites,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}
