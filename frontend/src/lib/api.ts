import { ProjectItem, EdcaDetails, DaytradDetails } from "./types";

export function getApiBase(): string {
  // 1. If in browser environment, resolve dynamically based on window.location
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // If accessed via Tailscale IP or remote domain (e.g. 100.105.249.12)
    if (host !== "localhost" && host !== "127.0.0.1") {
      // In Docker deployment, Backend is published on host port 8005
      return `${protocol}//${host}:8005`;
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

export function getChartImageUrl(filename: string): string {
  const base = getApiBase();
  return `${base}/api/v1/projects/daytrad/charts/${filename}`;
}
