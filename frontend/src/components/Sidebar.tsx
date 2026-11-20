"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Activity,
  ShieldCheck,
  Command,
  ChevronRight
} from "lucide-react";
import { useLive } from "@/lib/live";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { projects, status } = useLive();

  const navItems = [
    {
      name: "Overview",
      subname: "ภาพรวมพอร์ตและคำสั่ง",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Daytrad Bot",
      subname: "9 Specialist Markets",
      href: "/daytrad",
      icon: TrendingUp,
      badge: "MT5",
    },
    {
      name: "EDCA Wealth",
      subname: "Dynamic Value Averaging",
      href: "/edca",
      icon: PieChart,
      badge: "฿50",
    },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-black/80 backdrop-blur-2xl flex flex-col justify-between h-screen fixed left-0 top-0 z-40 select-none">
      <div>
        {/* Apple macOS style App Titlebar */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06] gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-b from-[#2c2c2e] to-[#1c1c1e] border border-white/[0.12] flex items-center justify-center text-white font-semibold text-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <Command className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-semibold text-[13px] tracking-tight text-white flex items-center gap-1.5">
              Trader Hub
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-neutral-300 font-mono">v1.0</span>
            </div>
            <div className="text-[11px] text-[#86868b] font-normal tracking-tight">FinTech Command</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6">
          <div>
            <div className="text-[11px] font-medium text-[#86868b] px-3 mb-2 tracking-tight">
              Portals
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.12] text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] backdrop-blur-md"
                        : "text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#86868b]"}`} strokeWidth={1.75} />
                      <div className="flex flex-col">
                        <span className="leading-tight">{item.name}</span>
                        <span className="text-[10px] text-[#86868b] font-normal">{item.subname}</span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-white/[0.06] text-[#86868b]"
                      }`}>
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
            <div className="text-[11px] font-medium text-[#86868b] px-3 mb-2 tracking-tight flex items-center justify-between">
              <span>Active Engines ({projects.length})</span>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === "live" ? "bg-[#30d158]" : "bg-[#ff9f0a]"}`} />
            </div>
            <div className="space-y-1">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12px] flex items-center justify-between text-neutral-300 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="truncate font-medium">{p.name}</div>
                  <span className={`w-2 h-2 rounded-full ${p.online ? "bg-[#30d158]" : "bg-[#ff9f0a]"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extensibility & Status Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="p-3 rounded-2xl bg-[#161618] border border-white/[0.06] text-[11px] text-[#86868b] space-y-1">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" strokeWidth={2} />
            <span>Zero-Intrusion Bridge</span>
          </div>
          <p className="text-[11px] text-[#86868b] leading-relaxed">
            Non-invasive connector gateway keeping native bot code intact.
          </p>
        </div>
      </div>
    </aside>
  );
};
