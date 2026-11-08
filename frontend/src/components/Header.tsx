"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe } from "lucide-react";

export const Header: React.FC = () => {
  const [bkkTime, setBkkTime] = useState<string>("");
  const [nyTime, setNyTime] = useState<string>("");

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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#30d158]/10 border border-[#30d158]/20 text-[#30d158] text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
          <span className="hidden sm:inline">Connected</span>
        </div>
      </div>
    </header>
  );
};
