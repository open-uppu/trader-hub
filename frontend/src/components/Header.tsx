"use client";

import React, { useState, useEffect } from "react";
import { Clock, Shield, Sparkles } from "lucide-react";

export const Header: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <span>PORTAL MONITOR</span>
          <span className="text-zinc-600">/</span>
          <span className="text-xs text-zinc-400 font-mono">Workspace: trader</span>
        </h1>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>BKK: {timeStr || "Loading..."}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GATEWAY ONLINE</span>
        </div>
      </div>
    </header>
  );
};
