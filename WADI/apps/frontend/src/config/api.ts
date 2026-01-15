const cleanBaseUrl = (url: string) => url.replace(/\/+$/, "");
const envApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Force /api prefix if not present, but avoid double slash
export const API_URL = envApiUrl.endsWith("/api") 
    ? envApiUrl 
    : `${cleanBaseUrl(envApiUrl)}/api`;

export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
