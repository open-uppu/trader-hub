"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Layers, 
  ExternalLink, 
  PlusCircle, 
  Activity,
  ShieldCheck
} from "lucide-react";
import { fetchProjects } from "@/lib/api";
import { ProjectItem } from "@/lib/types";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects);
  }, []);

  const navItems = [
    {
      name: "ภาพรวม Hub (Overview)",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Daytrad Bot (XAUUSD)",
      href: "/daytrad",
      icon: TrendingUp,
      badge: "MT4/Vision",
    },
    {
      name: "EDCA Portfolio",
      href: "/edca",
      icon: PieChart,
      badge: "AI Advisor",
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between h-screen fixed left-0 top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-black font-extrabold text-sm shadow-lg shadow-cyan-950">
            TH
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-zinc-100 flex items-center gap-1.5">
              TRADER HUB
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-cyan-400 font-mono">v1.0</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Multi-Project Portal</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider px-3 mb-2">
              Main Terminal
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-800/90 text-white border border-zinc-700 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Dynamic Registered Connectors */}
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Active Connectors ({projects.length})</span>
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-900 text-xs flex items-center justify-between"
                >
                  <div className="truncate font-mono text-zinc-300">{p.name}</div>
                  <span className={`w-2 h-2 rounded-full ${p.online ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-amber-400"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extensibility & Status Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Intrusion Mode</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            เชื่อมต่อแบบ Gateway ไม่แก้ไขโค้ดเดิมในแต่ละโปรเจกต์
          </p>
        </div>
      </div>
    </aside>
  );
};
