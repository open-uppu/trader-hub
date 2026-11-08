"use client";

import React, { useState, useEffect } from "react";
import { Clock, Shield, Sparkles, Globe } from "lucide-react";

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
          hour12: false
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <span className="font-bold tracking-tight">TRADER CENTRAL HUB</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">Workspace: trader</span>
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>NY: {nyTime || "--:--:--"}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>BKK: {bkkTime || "--:--:--"}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">GATEWAY ONLINE</span>
          <span className="sm:hidden">LIVE</span>
        </div>
      </div>
    </header>
  );
};
