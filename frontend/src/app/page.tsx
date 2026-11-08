"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  PieChart, 
  ArrowUpRight, 
  Layers, 
  DollarSign, 
  Zap, 
  Calendar, 
  ShieldCheck,
  Activity,
  Compass,
  Sparkles,
  Download,
  CheckCircle2,
  Wallet,
  Radar,
  ArrowRight
} from "lucide-react";
import { fetchProjects, fetchEdcaDetails, fetchDaytradDetails } from "@/lib/api";
import { ProjectItem, EdcaDetails, DaytradDetails } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

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

  // Compute aggregated wealth numbers
  const daytradEquity = daytrad?.account?.equity || daytrad?.summary?.current_equity_usd || 10000.0;
  const daytradBalance = daytrad?.account?.balance || daytrad?.summary?.base_capital_usd || 10000.0;
  const edcaUsd = edca?.summary?.total_portfolio_usd || 2225.98;
  const edcaThb = edca?.summary?.total_portfolio_thb || 76796.31;
  const totalWealthUsd = daytradEquity + edcaUsd;
  const fxRate = edcaUsd > 0 ? (edcaThb / edcaUsd) : 34.5;
  const totalWealthThb = totalWealthUsd * fxRate;

  const daytradExec = daytrad?.execution_status || daytrad?.summary?.execution_status;
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Institutional Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRADER CENTRAL HUB • QUANT COMMAND & WEALTH ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ศูนย์บัญชาการระบบเทรดและพอร์ตการลงทุนรวม
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              มอนิเตอร์บอทเทรด <strong className="text-zinc-200">Daytrad (9 Specialists)</strong> และพอร์ตหุ้น <strong className="text-zinc-200">EDCA Wealth Radar (Dime! ฿50 Rule)</strong> ควบคุมความเสี่ยงและจัดสรรเงินทุนแบบเรียลไทม์ในที่เดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/daytrad"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-all hover:border-amber-500/40 flex items-center gap-2 shadow-sm"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Daytrad Console</span>
            </Link>
            <Link
              href="/edca"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
            >
              <PieChart className="w-4 h-4 text-black" />
              <span>EDCA Portfolio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Aggregated Total Wealth & Capital Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-7 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-lg">
        {/* Total Wealth Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-zinc-800/80 pb-6 lg:pb-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>มูลค่าพอร์ตรวมทั้งหมด (Total Net Worth)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 font-bold">
                COMBINED AUM
              </span>
            </div>

            <div className="mt-3">
              <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
                ${totalWealthUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                ≈ ฿{totalWealthThb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-zinc-500 text-[11px]">ทุน Daytrad (9 ตลาด)</div>
              <div className="font-bold text-amber-400 mt-0.5">${daytradEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="text-[10px] text-zinc-500">100% Free Margin</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
              <div className="text-zinc-500 text-[11px]">พอร์ต EDCA (13 หุ้น)</div>
              <div className="font-bold text-cyan-400 mt-0.5">฿{edcaThb.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
              <div className="text-[10px] text-zinc-500">${edcaUsd.toFixed(2)} USD</div>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tile 1: Daytrad Execution */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Daytrad Squad Telemetry</span>
              <span className={`w-2 h-2 rounded-full ${daytradExec?.state === "IN_POSITION" ? "bg-amber-400 animate-ping" : "bg-cyan-400 animate-pulse"}`} />
            </div>
            <div className="my-2">
              <div className="text-lg font-bold text-zinc-100 font-mono">
                {daytradExec?.badge || "WAIT / SCANNING (รอจังหวะ)"}
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                {daytradExec?.message || "ระบบมอนิเตอร์สัญญาณและรอจังหวะแท่งเทียน M5/M15 ทั้ง 9 สินทรัพย์"}
              </p>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-900 flex justify-between">
              <span>เป้าหมายกำไรรายวัน:</span>
              <span className="text-emerald-400 font-bold">+3.0% ($300)</span>
            </div>
          </div>

          {/* Tile 2: EDCA Weekly Execution */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>EDCA Weekly Investment</span>
              <span className="text-emerald-400 font-bold">Dime! ฿50 Enforced</span>
            </div>
            <div className="my-2">
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ฿{(edca?.summary?.recommended_weekly_thb || 850).toLocaleString()} THB
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Dynamic Multiplier: <span className="text-cyan-400 font-bold font-mono">{edca?.summary?.multiplier || 0.85}x</span> (ฐาน ฿1,000)
              </p>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-900 flex justify-between">
              <span>วันเข้าซื้อที่ดีที่สุด:</span>
              <span className="text-cyan-400 font-bold">{edca?.optimal_day || "วันอังคาร"}</span>
            </div>
          </div>

          {/* Tile 3: Top Weekly Picks */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between sm:col-span-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
              <span>หุ้นแนะนำเข้าซื้อสัปดาห์นี้ (Active Buy Allocation)</span>
              <span className="text-[10px] text-zinc-500">ขั้นต่ำ ฿50 ทุกออเดอร์</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topEdcaBuys.length > 0 ? (
                topEdcaBuys.map((buy, idx) => (
                  <div key={buy.ticker} className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-zinc-100 font-mono text-xs flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">#{idx + 1}</span>
                        <span>{buy.ticker}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[120px]">{buy.action}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-emerald-400 text-xs">฿{buy.allocated_thb.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">{buy.percentage}%</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-500 col-span-3 text-center py-2">กำลังคำนวณการจัดสรร...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Command Squad Showcases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Squad 1: Daytrad Autonomous Multi-Asset Bot */}
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    Daytrad Autonomous Squad
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  หน่วยรบเทรดดิ้ง 9 ผู้เชี่ยวชาญ ผสาน Quant Indicator + Multimodal Vision และระบบล็อกกำไร 3% รายวัน
                </p>
              </div>
              <StatusBadge status={daytrad?.summary?.bot_status?.includes("ONLINE") ? "active" : "standby"} />
            </div>

            {/* 9 Markets Mini Grid */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase font-mono tracking-wider flex items-center justify-between">
                <span>9 Specialist Markets</span>
                <span className="text-[10px] text-amber-400 font-bold">Squad Ready</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                {specialistMarkets.map((m) => (
                  <div key={m.key} className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-zinc-300">
                    <span className="font-bold text-white">{m.symbol}</span>
                    <span className="text-[9px] text-zinc-500">{m.cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-zinc-800/80 font-mono text-center">
              <div>
                <div className="text-[11px] text-zinc-500">Equity พอร์ต</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">${daytradEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-500">เป้าหมายกำไร</div>
                <div className="text-sm font-extrabold text-amber-400 mt-0.5">+3.0% ($300)</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-500">ออเดอร์ในตลาด</div>
                <div className="text-sm font-extrabold text-cyan-400 mt-0.5">{daytrad?.open_positions?.length || 0} ไม้</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/daytrad"
              className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 border border-zinc-700 transition-all group-hover:border-amber-500/50 shadow-md"
            >
              <span>เข้าสู่หน้าควบคุม Daytrad Console</span>
              <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Squad 2: EDCA Multi-Factor Wealth Engine */}
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    EDCA Wealth & Rebalancer Engine
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  ระบบจัดสรรเงินลงทุน DCA ประจำสัปดาห์ตามคะแนนส่วนลดราคาจาก ATH คุมกฎขั้นต่ำ ฿50 บน Dime!
                </p>
              </div>
              <StatusBadge status="active" />
            </div>

            {/* Top Picks Leaderboard Preview */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase font-mono tracking-wider flex items-center justify-between">
                <span>Top Weekly Buys (อันดับ 1-3)</span>
                <span className="text-[10px] text-emerald-400 font-bold">฿50 Enforced</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {topEdcaBuys.slice(0, 3).map((item, idx) => (
                  <div key={item.ticker} className="p-2 rounded-lg bg-zinc-900 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white">{item.ticker}</span>
                      <span className="text-[10px] text-zinc-400">({item.action})</span>
                    </div>
                    <div className="font-bold text-emerald-400">฿{item.allocated_thb.toLocaleString()} ({item.percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-zinc-800/80 font-mono text-center">
              <div>
                <div className="text-[11px] text-zinc-500">พอร์ต Dime! รวม</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">฿{edcaThb.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-500">งบลงทุนสัปดาห์นี้</div>
                <div className="text-sm font-extrabold text-cyan-400 mt-0.5">฿{(edca?.summary?.recommended_weekly_thb || 850).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-500">วันเข้าซื้อที่ดีสุด</div>
                <div className="text-sm font-extrabold text-zinc-200 mt-0.5">{edca?.optimal_day || "วันอังคาร"}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/edca"
              className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 border border-zinc-700 transition-all group-hover:border-emerald-500/50 shadow-md"
            >
              <span>เข้าสู่กระดานจัดอันดับ EDCA Portfolio</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Institutional Architecture & Guardrails */}
      <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            สถาปัตยกรรมระบบและความปลอดภัย (Institutional Guardrails)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero-Intrusion Architecture</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              เชื่อมต่อผ่านระบบ BaseConnector Gateway แบบแยกอิสระ ไม่มีการแก้ไขโค้ดการคำนวณหลักของ Daytrad หรือ EDCA
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dime! 50 THB Rule Engine</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              ควบคุมการจัดสรรงบไม่ให้มีออเดอร์ใดต่ำกว่า ฿50.00 และดึงหุ้นใหม่เกรด A+ จากเรดาร์เข้ามาจัดสรรแบบ Dynamic
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confluence & Safety Lock</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              บอทเทรดล็อกเป้าหมายกำไร 3% รายวัน คัทออฟ -2% และตรวจสอบเงื่อนไขความเสี่ยง 3 ชั้นก่อนเปิดออเดอร์เสมอ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
