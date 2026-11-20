"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CandleBar,
  fetchDaytradBars,
  fetchDaytradDetails,
  fetchEdcaDetails,
  fetchProjects,
  getWsCandidates,
} from "./api";
import { DaytradDetails, EdcaDetails, ProjectItem } from "./types";

export type LiveStatus = "connecting" | "live" | "reconnecting" | "offline";

interface LiveValue {
  status: LiveStatus;
  hydrated: boolean;
  latencyMs: number | null;
  lastEventAt: number | null;
  projects: ProjectItem[];
  edca: EdcaDetails | null;
  daytrad: DaytradDetails | null;
  bars: CandleBar[];
  barSymbol: string;
  setBarSubscription: (symbol: string, timeframe?: string) => void;
  reconnect: () => void;
}

const LiveContext = createContext<LiveValue | null>(null);

export function useLive(): LiveValue {
  const ctx = useContext(LiveContext);
  if (!ctx) {
    throw new Error("useLive must be used within LiveProvider");
  }
  return ctx;
}

function mergeDaytrad(prev: DaytradDetails | null, tick: any): DaytradDetails {
  const summaryPatch = tick.summary || {};
  const account = {
    ...(prev?.account || {}),
    ...(tick.account || {}),
    ...(summaryPatch.account || {}),
  };
  const execution = tick.execution_status || summaryPatch.execution_status || prev?.execution_status;
  const summary = {
    ...(prev?.summary || {}),
    ...summaryPatch,
    account,
    execution_status: execution || prev?.summary?.execution_status,
  };
  const dailyPct = summary.daily_return_pct ?? prev?.daily_target?.current_pct ?? 0;
  return {
    ...(prev || {}),
    account,
    portfolio: tick.portfolio ?? prev?.portfolio,
    summary,
    execution_status: execution,
    open_positions: tick.open_positions ?? prev?.open_positions ?? [],
    closed_orders: tick.closed_orders ?? prev?.closed_orders ?? [],
    specialists: tick.specialists ?? prev?.specialists,
    charts: prev?.charts || [],
    learned_rules: prev?.learned_rules || "",
    mistakes_database: prev?.mistakes_database || "",
    daily_target: {
      target_pct: 3,
      cutoff_pct: -5,
      rules: [],
      ...(prev?.daily_target || {}),
      current_pct: dailyPct,
      status: execution?.state || prev?.daily_target?.status || "STANDBY",
    },
  } as DaytradDetails;
}

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [hydrated, setHydrated] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [edca, setEdca] = useState<EdcaDetails | null>(null);
  const [daytrad, setDaytrad] = useState<DaytradDetails | null>(null);
  const [bars, setBars] = useState<CandleBar[]>([]);
  const [barSymbol, setBarSymbol] = useState("XAUUSD");

  const symbolRef = useRef("XAUUSD");
  const tfRef = useRef("M5");
  const wsRef = useRef<WebSocket | null>(null);
  const pingAt = useRef<number | null>(null);
  const connectRef = useRef<() => void>(() => {});
  const barRequest = useRef(0);

  const applyMessage = useCallback((data: any) => {
    if (!data || typeof data !== "object") return;
    if (data.type === "pong") {
      if (pingAt.current != null) {
        setLatencyMs(Math.max(1, Math.round(performance.now() - pingAt.current)));
      }
      return;
    }
    if (data.type === "snapshot") {
      if (Array.isArray(data.projects) && data.projects.length) setProjects(data.projects);
      if (data.edca) setEdca(data.edca);
      if (data.daytrad) setDaytrad(data.daytrad);
      setLastEventAt(Date.now());
      setHydrated(true);
      return;
    }
    if (data.type === "tick") {
      setDaytrad((prev) => mergeDaytrad(prev, data));
      if (
        data.symbol &&
        String(data.symbol).toUpperCase() === symbolRef.current &&
        Array.isArray(data.bars) &&
        data.bars.length
      ) {
        setBars(data.bars);
      }
      setLastEventAt(Date.now());
      return;
    }
    if (data.type === "bars" && String(data.symbol || "").toUpperCase() === symbolRef.current && Array.isArray(data.bars)) {
      setBars(data.bars);
      setLastEventAt(Date.now());
    }
  }, []);

  const loadBars = useCallback((symbol: string) => {
    const requestId = ++barRequest.current;
    fetchDaytradBars(symbol).then((rows) => {
      if (requestId !== barRequest.current || symbolRef.current !== symbol || !rows.length) return;
      setBars((curr) => (curr.length ? curr : rows));
    });
  }, []);

  useEffect(() => {
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry: number | null = null;
    let ping: number | null = null;
    let attempt = 0;

    const clearRetry = () => {
      if (retry != null) {
        window.clearTimeout(retry);
        retry = null;
      }
    };

    const cleanupSocket = () => {
      if (ping != null) window.clearInterval(ping);
      ping = null;
      if (socket) {
        socket.onclose = null;
        socket.onmessage = null;
        socket.onerror = null;
        try { socket.close(); } catch { /* already closed */ }
        if (wsRef.current === socket) wsRef.current = null;
        socket = null;
      }
    };

    const schedule = (opened: boolean) => {
      if (stopped) return;
      if (!opened) attempt += 1;
      const candidates = getWsCandidates();
      setStatus(!opened && attempt >= Math.max(candidates.length, 1) ? "offline" : "reconnecting");
      const delay = Math.min(8000, 800 * Math.pow(1.5, Math.min(attempt, 8)));
      clearRetry();
      retry = window.setTimeout(connect, delay);
    };

    const connect = () => {
      if (stopped) return;
      clearRetry();
      cleanupSocket();
      const candidates = getWsCandidates();
      if (!candidates.length) {
        setStatus("offline");
        return;
      }
      const url = candidates[attempt % candidates.length];
      setStatus(attempt > 0 ? "reconnecting" : "connecting");
      let opened = false;
      try {
        socket = new WebSocket(url);
      } catch {
        schedule(false);
        return;
      }
      wsRef.current = socket;
      socket.onopen = () => {
        opened = true;
        attempt = 0;
        setStatus("live");
        socket?.send(JSON.stringify({
          action: "subscribe",
          symbol: symbolRef.current,
          timeframe: tfRef.current,
        }));
        ping = window.setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            pingAt.current = performance.now();
            socket.send("ping");
          }
        }, 15000);
      };
      socket.onmessage = (event) => {
        try {
          applyMessage(JSON.parse(event.data));
        } catch {
          /* ignore malformed frames */
        }
      };
      socket.onerror = () => {
        /* close handler retries */
      };
      socket.onclose = () => {
        if (ping != null) window.clearInterval(ping);
        ping = null;
        if (wsRef.current === socket) wsRef.current = null;
        if (stopped) return;
        setStatus("reconnecting");
        schedule(opened);
      };
    };

    connectRef.current = () => {
      attempt = 0;
      connect();
    };
    connect();

    let cancelled = false;
    Promise.all([fetchProjects(), fetchEdcaDetails(), fetchDaytradDetails()])
      .then(([nextProjects, nextEdca, nextDaytrad]) => {
        if (cancelled) return;
        if (nextProjects.length) {
          setProjects((curr) => (curr.length ? curr : nextProjects));
        }
        if (nextEdca) setEdca((curr) => curr ?? nextEdca);
        if (nextDaytrad) setDaytrad((curr) => curr ?? nextDaytrad);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    loadBars(symbolRef.current);

    return () => {
      stopped = true;
      cancelled = true;
      clearRetry();
      cleanupSocket();
      connectRef.current = () => {};
    };
  }, [applyMessage, loadBars]);

  const reconnect = useCallback(() => {
    setStatus("connecting");
    connectRef.current();
  }, []);

  const setBarSubscription = useCallback((symbol: string, timeframe = "M5") => {
    const next = symbol.toUpperCase();
    const tf = timeframe.toUpperCase();
    if (symbolRef.current !== next) setBars([]);
    symbolRef.current = next;
    tfRef.current = tf;
    setBarSymbol(next);
    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "subscribe", symbol: next, timeframe: tf }));
    }
    loadBars(next);
  }, [loadBars]);

  const value = useMemo<LiveValue>(() => ({
    status,
    hydrated,
    latencyMs,
    lastEventAt,
    projects,
    edca,
    daytrad,
    bars,
    barSymbol,
    setBarSubscription,
    reconnect,
  }), [
    status,
    hydrated,
    latencyMs,
    lastEventAt,
    projects,
    edca,
    daytrad,
    bars,
    barSymbol,
    setBarSubscription,
    reconnect,
  ]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}
