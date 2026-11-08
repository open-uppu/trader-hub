import { ProjectItem, EdcaDetails, DaytradDetails } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchProjects(): Promise<ProjectItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/projects`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch projects");
    return await res.json();
  } catch (err) {
    console.error("fetchProjects error:", err);
    return [];
  }
}

export async function fetchEdcaDetails(): Promise<EdcaDetails | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/projects/edca/details`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch EDCA details");
    return await res.json();
  } catch (err) {
    console.error("fetchEdcaDetails error:", err);
    return null;
  }
}

export async function fetchDaytradDetails(): Promise<DaytradDetails | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/projects/daytrad/details`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch Daytrad details");
    return await res.json();
  } catch (err) {
    console.error("fetchDaytradDetails error:", err);
    return null;
  }
}

export function getChartImageUrl(filename: string): string {
  return `${API_BASE}/api/v1/projects/daytrad/charts/${filename}`;
}
