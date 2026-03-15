const isDev = process.env.NODE_ENV === "development";

/** Backend API base URL - dev uses NEXT_PUBLIC_API_URL_DEV, prod uses NEXT_PUBLIC_API_URL */
export const API_BASE_URL =
  (isDev ? process.env.NEXT_PUBLIC_API_URL_DEV : process.env.NEXT_PUBLIC_API_URL) ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_URL_DEV ??
  "http://localhost:5001";

export const API_ENDPOINTS = {
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  FORGOT_PASSWORD: "/api/auth/password/forgot",
  RESET_PASSWORD: "/api/auth/password/reset",
  ENABLED_FEATURES: "/api/auth/enabled-features",
  PROFILE: "/api/auth/profile",
} as const;

export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
