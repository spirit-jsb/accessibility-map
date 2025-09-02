import { getEnvVar, getCurrentEnv } from "../utils/envUtils.js";

export const API_CONFIG = {
  DATA_SOURCE: getEnvVar("VITE_DATA_SOURCE", "static"),

  API: {
    BASE_URL: getEnvVar("VITE_API_BASE_URL", ""),
    TIMEOUT: parseInt(getEnvVar("VITE_API_TIMEOUT", "5000")),
    ENDPOINTS: {
      FACILITY_CATEGORIES: "/api/accessibility/facility-categories",
      FACILITY_TYPES: "/api/accessibility/facility-types",
      FACILITY_ICON_MAPPINGS: "/api/accessibility/facility-icon-mappings",
      FACILITIES: "/api/accessibility/facilities",
    },
    HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },

  STATIC: {
    BASE_PATH: "/data",
    ENDPOINTS: {
      FACILITY_CATEGORIES: "/accessibility/facility-categories.json",
      LABOR_PARK_FACILITY_TYPES:
        "/accessibility/labor-park-facility-types.json",
      LABOR_PARK_FACILITY_ICON_MAPPINGS:
        "/accessibility/labor-park-facility-icon-mappings.json",
      LABOR_PARK_FACILITIES: "/accessibility/labor-park-facilities.json",
    },
  },

  CACHE: {
    ENABLED: getEnvVar("VITE_CACHE_ENABLED", "true") === "true",
    TTL: parseInt(getEnvVar("VITE_CACHE_TTL", "300000")),
    KEYS: {
      FACILITY_CATEGORIES: "facility_categories",
      LABOR_PARK_FACILITY_TYPES: "labor_park_facility_types",
      LABOR_PARK_FACILITY_ICON_MAPPINGS: "labor_park_facility_icon_mappings",
      LABOR_PARK_FACILITIES: "labor_park_facilities",
    },
  },

  RETRY: {
    ENABLED: true,
    MAX_ATTEMPTS: getCurrentEnv() === "production" ? 3 : 1,
    DELAY: 1000,
  },
};
