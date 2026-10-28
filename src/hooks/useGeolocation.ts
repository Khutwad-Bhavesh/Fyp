"use client";

import { useState, useCallback, useEffect } from "react";

export interface GeoLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser or device.",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMsg = "Unable to retrieve device GPS location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location permission denied. Please allow GPS access in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "GPS location information is currently unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out. Please try again.";
            break;
        }
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { ...state, refreshLocation: getLocation };
}
