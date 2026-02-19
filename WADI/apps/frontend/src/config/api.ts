export const API_URL =
  import.meta.env.VITE_API_URL || "https://wadi-api-u2vx.onrender.com";

export const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
