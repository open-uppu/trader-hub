"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";
import { useLive } from "@/lib/live";

export const Header: React.FC = () => {
  const { status, latencyMs } = useLive();
  const [bkkTime, setBkkTime] = useState<string>("");
  const [nyTime, setNyTime] = useState<string>("");
  const live = status === "live";
  const tone = live ? "#30d158" : status === "offline" ? "#ff453a" : "#ff9f0a";
  const label = live ? "WS Live" : status === "offline" ? "WS Offline" : "WS Connecting";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setBkkTime(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        })
      );
      setNyTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "America/New_York",
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] font-semibold text-white tracking-tight">
          Trader Central Hub
        </span>
        <span className="text-white/20 text-xs">•</span>
        <span className="text-[12px] text-[#86868b] font-normal hidden sm:inline">
          Autonomous Systems Portal
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
        {/* New York Market Time */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 font-mono text-[11px]">
          <Globe className="w-3 h-3 text-[#ff9f0a]" strokeWidth={2} />
          <span className="text-[#86868b]">NY</span>
          <span className="font-medium text-white">{nyTime || "--:--:--"}</span>
        </div>

        {/* Bangkok Time */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-[#0071e3]" strokeWidth={2} />
          <span className="text-[#86868b]">BKK</span>
          <span className="font-medium text-white">{bkkTime || "--:--:--"}</span>
        </div>

        {/* Live Status Indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
          style={{ color: tone, backgroundColor: `${tone}1a`, borderColor: `${tone}33` }}
          title={latencyMs != null ? `WebSocket round-trip ${latencyMs} ms` : "WebSocket stream"}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: tone }} />
          <span className="hidden sm:inline">{label}{live && latencyMs != null ? ` ${latencyMs}ms` : ""}</span>
        </div>
      </div>
    </header>
  );
};
