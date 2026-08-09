import axios from "axios";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 300_000,
});

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    return (
      data?.detail ||
      data?.message ||
      data?.error ||
      err.message ||
      "Request failed"
    );
  }
  return err instanceof Error ? err.message : "Unknown error";
}
