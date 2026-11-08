"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  PieChart, 
  ArrowUpRight, 
  ShieldCheck,
  Download,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { fetchProjects, fetchEdcaDetails, fetchDaytradDetails } from "@/lib/api";
import { ProjectItem, EdcaDetails, DaytradDetails } from "@/lib/types";

export default function OverviewPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [edca, setEdca] = useState<EdcaDetails | null>(null);
  const [daytrad, setDaytrad] = useState<DaytradDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pList, eData, dData] = await Promise.all([
          fetchProjects(),
          fetchEdcaDetails(),
          fetchDaytradDetails()
        ]);
        setProjects(pList);
        setEdca(eData);
        setDaytrad(dData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Aggregated values
  const daytradEquity = daytrad?.account?.equity || daytrad?.summary?.current_equity_usd || 10000.0;
  const daytradBalance = daytrad?.account?.balance || daytrad?.summary?.base_capital_usd || 10000.0;
  const edcaUsd = edca?.summary?.total_portfolio_usd || 2225.98;
  const edcaThb = edca?.summary?.total_portfolio_thb || 76796.31;
  const totalWealthUsd = daytradEquity + edcaUsd;
  const fxRate = edcaUsd > 0 ? (edcaThb / edcaUsd) : 34.5;
  const totalWealthThb = totalWealthUsd * fxRate;

  const topEdcaBuys = (edca?.weekly_execution?.allocations || []).filter(a => a.allocated_thb > 0);

  const specialistMarkets = [
    { key: "gold", symbol: "XAUUSD", name: "Gold", cat: "Commodity" },
    { key: "btc", symbol: "BTCUSD", name: "Bitcoin", cat: "Crypto" },
    { key: "eth", symbol: "ETHUSD", name: "Ethereum", cat: "Crypto" },
    { key: "xag", symbol: "XAGUSD", name: "Silver", cat: "Commodity" },
    { key: "gbp", symbol: "GBPUSD", name: "GBP/USD", cat: "Forex" },
    { key: "eur", symbol: "EURUSD", name: "EUR/USD", cat: "Forex" },
    { key: "xpt", symbol: "XPTUSD", name: "Platinum", cat: "Metal" },
    { key: "oil", symbol: "UKOIL", name: "Brent Oil", cat: "Energy" },
    { key: "gas", symbol: "XNGUSD", name: "Nat Gas", cat: "Energy" },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Apple Card Style Total Portfolio Banner */}
      <section className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-[#161618] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#86868b] text-[11px] font-medium tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-[#ff9f0a]" />
              <span>TOTAL AGGREGATED NET WORTH</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-4">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white tabular-nums">
                ${totalWealthUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <span className="text-base sm:text-lg text-[#86868b] font-mono">
                ≈ ฿{totalWealthThb.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-[13px] text-[#86868b] max-w-xl leading-relaxed">
              ศูนย์รวมการควบคุมพอร์ตเทรดอัตโนมัติ Daytrad (9 สินทรัพย์) และพอร์ตหุ้นสหรัฐฯ EDCA (Dime! ฿50 Rule) พร้อมสตรีมข้อมูลแบบเรียลไทม์
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30d158]/10 text-[#30d158] text-[11px] font-medium border border-[#30d158]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                Daily Target: 3.0%
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] text-[#86868b] text-[11px] font-medium border border-white/[0.08]">
                MT5: Exness Trial14
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] text-[#86868b] text-[11px] font-medium border border-white/[0.08]">
                Dime! Min ฿50
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/daytrad"
              className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-[13px] font-medium transition-all active:scale-[0.98] shadow-sm flex items-center gap-2"
            >
              <span>Daytrad Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/edca"
              className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1] text-[13px] font-medium transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span>EDCA Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="http://100.93.63.86:8000/api/v1/download/mt5-sync-zip"
              className="px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#86868b] hover:text-white border border-white/[0.06] text-[12px] font-medium transition-all flex items-center gap-2"
              title="Download 1-Click Windows Native MT5 Sync"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sync Tool</span>
            </a>
          </div>
        </div>
      </section>

      {/* Dual Engine Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daytrad Card */}
        <div className="p-7 rounded-3xl bg-[#161618] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white">
                  <TrendingUp className="w-4 h-4 text-[#ff9f0a]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">Daytrad Squad</h2>
                  <p className="text-[12px] text-[#86868b]">9 Specialist Agents • MT5 Native</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#30d158]/10 text-[#30d158] text-[11px] font-medium border border-[#30d158]/20">
                Live Ready
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
              <div>
                <div className="text-[11px] text-[#86868b]">Account Equity</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  ${daytradEquity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#86868b]">Balance</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  ${daytradBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#86868b]">Account ID</div>
                <div className="text-xs font-mono text-neutral-300 mt-1">
                  416568420
                </div>
              </div>
            </div>

            {/* Specialist Markets Pill Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-medium text-[#86868b] tracking-tight">
                9 Specialized Markets
              </div>
              <div className="grid grid-cols-3 gap-2">
                {specialistMarkets.map((m) => (
                  <div
                    key={m.key}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-white font-mono">{m.symbol}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-[#86868b]">
                        {m.cat}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#86868b] mt-0.5 truncate">{m.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/daytrad"
              className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-[12px] font-medium border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Specialist Trading Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* EDCA Wealth Radar Card */}
        <div className="p-7 rounded-3xl bg-[#161618] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white">
                  <PieChart className="w-4 h-4 text-[#30d158]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">EDCA Wealth Radar</h2>
                  <p className="text-[12px] text-[#86868b]">Dynamic Value Averaging • Dime! ฿50 Rule</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[11px] font-medium border border-[#0071e3]/20">
                Weekly Cycle
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
              <div>
                <div className="text-[11px] text-[#86868b]">Portfolio USD</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  ${edcaUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#86868b]">Portfolio THB</div>
                <div className="text-base font-semibold text-white font-mono mt-0.5">
                  ฿{edcaThb.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#86868b]">Next Rebalance</div>
                <div className="text-xs font-mono text-neutral-300 mt-1">
                  {edca?.optimal_day || "Friday"}
                </div>
              </div>
            </div>

            {/* Top Conviction Buys */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-medium text-[#86868b] tracking-tight">
                Current Rebalance Allocations
              </div>
              <div className="space-y-2">
                {topEdcaBuys.length > 0 ? (
                  topEdcaBuys.slice(0, 3).map((alloc, idx) => (
                    <div
                      key={alloc.ticker}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/[0.08] text-white text-[10px] font-semibold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-[13px] font-semibold text-white font-mono">{alloc.ticker}</div>
                          <div className="text-[10px] text-[#86868b]">{alloc.action}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-semibold text-white font-mono">฿{alloc.allocated_thb.toLocaleString()}</div>
                        <div className="text-[10px] text-[#30d158] font-medium">Valid (&gt; ฿50)</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[12px] text-[#86868b] text-center">
                    พอร์ตอยู่ในภาวะสมดุลตาม Target Value
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/edca"
              className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-[12px] font-medium border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
            >
              <span>View EDCA Investment Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Architecture & Guardrails */}
      <section className="p-7 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#30d158]" strokeWidth={2} />
            <span>Institutional Guardrails & Infrastructure</span>
          </h3>
          <p className="text-[12px] text-[#86868b]">
            มาตรฐานความปลอดภัยระดับสถาบันการเงินที่ถูกติดตั้งไว้เบื้องหลัง
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1.5">
            <div className="text-[13px] font-medium text-white">Zero-Intrusion Bridge</div>
            <p className="text-[11px] text-[#86868b] leading-relaxed">
              เชื่อมต่อผ่าน BaseConnector แบบคู่ขนาน ไม่แก้ไขโค้ดการเทรดหรือ logic ดั้งเดิมของแต่ละบอท
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1.5">
            <div className="text-[13px] font-medium text-white">฿50 Micro-Order Rule</div>
            <p className="text-[11px] text-[#86868b] leading-relaxed">
              คำนวณและปัดเศษคำสั่งซื้อให้สอดคล้องกับเกณฑ์ขั้นต่ำ 50 บาทของแอป Dime! ป้องกันออร์เดอร์ล้มเหลว
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] space-y-1.5">
            <div className="text-[13px] font-medium text-white">Correlation Confluence Lock</div>
            <p className="text-[11px] text-[#86868b] leading-relaxed">
              ล็อกความเสี่ยงระหว่างสินทรัพย์คู่ขนาน ป้องกันการเปิด Position สวนทิศทางหรือ Overleveraging ในเวลาเดียวกัน
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
