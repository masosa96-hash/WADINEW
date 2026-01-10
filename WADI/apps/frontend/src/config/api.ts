export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
