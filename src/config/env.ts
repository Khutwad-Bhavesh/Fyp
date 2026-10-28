/**
 * Centralized Environment Configuration
 * Decouples environment variables from business logic and presentation.
 */

export interface AppConfig {
  appName: string;
  companyName: string;
  isDev: boolean;
  isProd: boolean;
  apiBaseUrl: string;
  iot: {
    apiKey: string;
    telemetryIntervalSeconds: number;
    discrepancyTolerancePercentage: number;
  };
  geo: {
    maxCheckInDistanceMeters: number;
    requiredAccuracyMeters: number;
  };
  supabase: {
    url: string | null;
    anonKey: string | null;
  };
}

export const config: AppConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Shuchithwam Smart OWC",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "Rajeshree Enviro Solutions",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  iot: {
    apiKey: process.env.IOT_GATEWAY_API_KEY || "shuchithwam_iot_secure_token_2026",
    telemetryIntervalSeconds: parseInt(process.env.IOT_TELEMETRY_INTERVAL_SECONDS || "60", 10),
    discrepancyTolerancePercentage: parseInt(process.env.DISCREPANCY_TOLERANCE_PERCENTAGE || "25", 10),
  },
  geo: {
    maxCheckInDistanceMeters: parseInt(process.env.MAX_ALLOWED_CHECKIN_DISTANCE_METERS || "500", 10),
    requiredAccuracyMeters: parseInt(process.env.REQUIRE_GPS_ACCURACY_METERS || "100", 10),
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
  },
};

export default config;
