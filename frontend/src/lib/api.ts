import { ProjectItem, EdcaDetails, DaytradDetails } from "./types";

export function getApiBase(): string {
  // 1. If in browser environment, resolve dynamically based on window.location
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // If accessed via Tailscale IP or remote domain (e.g. 100.105.249.12)
    if (host !== "localhost" && host !== "127.0.0.1") {
      // Same origin: next.config.js rewrites /api/* to hub_backend. A cross-port
      // call to :8005 from a remote page is blocked by the browser ("Failed to fetch").
      return "";
    }

    // If accessed locally on port 3000, check if backend is 8005 or 8000
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return "http://127.0.0.1:8000";
  }

  // 2. Server-side rendering fallback
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
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
    // If primary failed and in browser, attempt fallback port 8000/8005
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const fallbackPort = primaryBase.includes("8005") ? "8000" : "8005";
      try {
        const fallbackRes = await fetch(`${protocol}//${host}:${fallbackPort}${endpoint}`, {
          cache: "no-store",
          signal: controller.signal
        });
        if (fallbackRes.ok) return fallbackRes;
      } catch (e) {
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
  const host = window.location.hostname;
  const sameOrigin = `${wsProto}//${window.location.host}/ws/telemetry`;
  const apiBase = getApiBase();
  const urls: string[] = [];

  if (apiBase.startsWith("http")) {
    urls.push(`${apiBase.replace(/^http/, "ws").replace(/\/$/, "")}/ws/telemetry`);
  }
  if (host !== "localhost" && host !== "127.0.0.1") {
    // Remote Tailscale clients must stay on the page origin. A cross-port
    // socket to :8005 is the same failure mode as a cross-port fetch.
    urls.push(sameOrigin);
    urls.push(`${wsProto}//${host}:8005/ws/telemetry`);
    urls.push(`${wsProto}//${host}:8000/ws/telemetry`);
  } else {
    urls.push(`${wsProto}//127.0.0.1:8000/ws/telemetry`);
    urls.push(`${wsProto}//127.0.0.1:8005/ws/telemetry`);
    urls.push(sameOrigin);
  }
  return Array.from(new Set(urls));
}

export function getChartImageUrl(filename: string): string {
  const base = getApiBase();
  return `${base}/api/v1/projects/daytrad/charts/${filename}`;
}
