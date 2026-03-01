const PROD_API = ""; // Relative proxy logic in prod since frontend/backend share domain

export const API_URL =
  import.meta.env.VITE_API_URL?.trim() || PROD_API;

if (!API_URL.startsWith("http")) {
  throw new Error("Invalid VITE_API_URL configuration");
}

export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
