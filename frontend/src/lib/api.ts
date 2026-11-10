import { ProjectItem, EdcaDetails, DaytradDetails } from "./types";

export function getApiBase(): string {
  // Browser always uses the page origin. Next rewrites /api/* to the Hub backend.
  // Port 8000 on this machine is the Daytrad MT5 bridge, not the Hub API.
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.HUB_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8005";
}

async function fetchWithFallback(endpoint: string, timeoutMs: number = 7000): Promise<Response> {
  const primaryBase = getApiBase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${primaryBase}${endpoint}`, {
      cache: "no-store",
      signal: controller.signal
    });
    if (res.ok) return res;
  } catch (err) {
    // Same-origin rewrite missed. Hub backend is published as 8005, never 8000.
    if (typeof window !== "undefined" && primaryBase === "") {
      const protocol = window.location.protocol;
      const host = window.location.hostname;
      try {
        const fallbackRes = await fetch(`${protocol}//${host}:8005${endpoint}`, {
          cache: "no-store",
          signal: controller.signal
        });
        if (fallbackRes.ok) return fallbackRes;
      } catch {
        // fallback failed as well
      }
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  throw new Error(`Failed to fetch ${endpoint}`);
}

export async function fetchProjects(): Promise<ProjectItem[]> {
  try {
    const res = await fetchWithFallback("/api/v1/projects");
    return await res.json();
  } catch (err) {
    console.error("fetchProjects error:", err);
    return [];
  }
}

export async function fetchEdcaDetails(): Promise<EdcaDetails | null> {
  try {
    const res = await fetchWithFallback("/api/v1/projects/edca/details");
    return await res.json();
  } catch (err) {
    console.error("fetchEdcaDetails error:", err);
    return null;
  }
}

export async function fetchDaytradDetails(): Promise<DaytradDetails | null> {
  try {
    const res = await fetchWithFallback("/api/v1/projects/daytrad/details");
    return await res.json();
  } catch (err) {
    console.error("fetchDaytradDetails error:", err);
    return null;
  }
}

export interface CandleBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchDaytradBars(symbol: string): Promise<CandleBar[]> {
  try {
    const res = await fetchWithFallback(`/api/v1/projects/daytrad/bars?symbol=${encodeURIComponent(symbol)}&timeframe=M5`);
    const data = await res.json();
    return Array.isArray(data.bars) ? data.bars : [];
  } catch (err) {
    console.error("fetchDaytradBars error:", err);
    return [];
  }
}

export function getWsCandidates(): string[] {
  if (typeof window === "undefined") return [];
  const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
  // Only the page origin. server.js proxies this to the Hub backend.
  // Do not open :8000 — that is the Daytrad bridge and it rejects /ws/telemetry.
  return [`${wsProto}//${window.location.host}/ws/telemetry`];
}

export function getChartImageUrl(filename: string): string {
  const base = getApiBase();
  return `${base}/api/v1/projects/daytrad/charts/${filename}`;
}
