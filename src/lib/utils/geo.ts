/**
 * Geolocation & Geofencing Utilities
 * Uses Haversine formula to compute physical distance between coordinates.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const earthRadiusMeters = 6371000; // Earth's mean radius in meters
  
  const dLat = degreesToRadians(coord2.latitude - coord1.latitude);
  const dLon = degreesToRadians(coord2.longitude - coord1.longitude);

  const lat1 = degreesToRadians(coord1.latitude);
  const lat2 = degreesToRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMeters * c);
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Verifies if a given coordinate is within the site's allowed geofence perimeter
 */
export function isWithinGeofence(
  workerCoord: Coordinates,
  siteCoord: Coordinates,
  maxDistanceMeters = 500
): { withinGeofence: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(workerCoord, siteCoord);
  return {
    withinGeofence: distance <= maxDistanceMeters,
    distanceMeters: distance,
  };
}
