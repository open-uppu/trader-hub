"use client";

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  BarChart2, 
  BookOpen, 
  Maximize2, 
  X,
  Clock,
  Sparkles,
  Activity,
  Compass,
  ArrowRight,
  RefreshCw,
  Wallet,
  Download
} from "lucide-react";
import { fetchDaytradDetails, getChartImageUrl } from "@/lib/api";
import { DaytradDetails, ChartItem } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";

export default function DaytradPage() {
  const [data, setData] = useState<DaytradDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartItem | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "mistakes">("rules");

  const loadData = (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    fetchDaytradDetails()
      .then((res) => {
        if (!res) {
          if (!silent) setError("ไม่สามารถเชื่อมต่อ Trader Central Hub Backend ได้ (พอร์ต 8000 ออฟไลน์)");
        } else {
          setData(res);
          setError(null);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      })
      .catch((err) => {
        if (!silent) setError("เกิดข้อผิดพลาดในการดึงข้อมูล Daytrad: " + String(err));
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData(true);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 font-mono text-sm space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <div>กำลังโหลดข้อมูล Daytrad Console (เชื่อมต่อ API พอร์ต 8000)...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl bg-zinc-900/90 border border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">ไม่สามารถเชื่อมต่อ Hub Backend ได้</h3>
          <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed">
            {error}
          </p>
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono text-left leading-relaxed">
            💡 <strong>สาเหตุที่โหลดนาน:</strong> ตัว Backend API (FastAPI) ยังไม่ได้ถูกสั่งรันที่พอร์ต 8000 ทำให้หน้าเว็บเชื่อมต่อไม่สำเร็จ<br/>
            🚀 <strong>วิธีเริ่มระบบ:</strong> สั่งรัน <code>cd hub && ./run.sh</code> เพื่อเปิดทั้ง Backend และ Frontend พร้อมกัน
          </div>
        </div>
        <button
          onClick={() => loadData(false)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors"
        >
          ลองเชื่อมต่อใหม่อีกครั้ง (Retry)
        </button>
      </div>
    );
  }

  const { summary, account, daily_target, charts, learned_rules, mistakes_database, execution_status, specialists, open_positions, closed_orders } = data;
  const execStatus = execution_status || summary.execution_status;
  const currentAccount = account || summary.account;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Agentic Multi-Asset Day Trading (9 Specialists)
            </h2>
            <StatusBadge status={summary.bot_status.includes("ONLINE") ? "active" : "standby"} />
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            คอนโซลควบคุมและมอนิเตอร์บอทเทรด 9 สินทรัพย์ (Gold, Crypto, Forex, Energy) พร้อมโมเดล Multimodal Chart Vision และระบบล็อกกำไรพอร์ต 3% ต่อวัน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="http://100.93.63.86:8000/api/v1/download/ea"
            download="AgenticMT5Bridge.mq5"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลดไฟล์ EA (.mq5)</span>
          </a>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-medium">
            9 สินทรัพย์: Gold, BTC, ETH, XAG, GBP, EUR, XPT, Oil, Gas
          </span>
        </div>
      </div>

      {/* Real-time Telemetry & Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400">LIVE TELEMETRY SYNC (5s)</span>
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-zinc-300">
            เซิร์ฟเวอร์: <span className="text-white font-semibold">{currentAccount?.server || "PaperTrading-Simulation"}</span>
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-zinc-300">
            พอร์ต: <span className="text-amber-400 font-semibold">#{currentAccount?.account_number || "99999999"}</span> ({currentAccount?.mode || "SIMULATION"})
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-400">
          <span>อัปเดตล่าสุด: {lastSyncTime || "กำลังเชื่อมต่อ..."}</span>
          <button 
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
            title="รีเฟรชข้อมูลสดทันที"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>ซิงก์สด</span>
          </button>
        </div>
      </div>

      {/* Real-time Portfolio & Equity Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Equity Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>มูลค่าพอร์ตสุทธิ (Equity)</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              REAL-TIME
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              ${(currentAccount?.equity || summary.current_equity_usd || 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              USD (มูลค่าพอร์ตรวมกำไร/ขาดทุนไม้ที่ถืออยู่)
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
            <span>เงินทุนเริ่มต้น:</span>
            <span className="text-zinc-200 font-mono">${(currentAccount?.balance || summary.base_capital_usd || 10000).toLocaleString()} USD</span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>เงินทุนคงเหลือ (Balance)</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
              FREE CASH
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
              ${(currentAccount?.balance || summary.base_capital_usd || 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              USD (เงินสดว่างพร้อมออกออเดอร์ใหม่)
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
            <span>สถานะเงินสด:</span>
            <span className="text-emerald-400 font-mono font-medium">100% Free Margin</span>
          </div>
        </div>

        {/* Floating PnL Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Floating PnL (ไม้ที่ถืออยู่)</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              (currentAccount?.floating_pnl || 0) > 0 ? "bg-emerald-500/20 text-emerald-400" :
              (currentAccount?.floating_pnl || 0) < 0 ? "bg-rose-500/20 text-rose-400" : "bg-zinc-800 text-zinc-400"
            }`}>
              {(open_positions?.length || 0)} POSITIONS
            </span>
          </div>
          <div className="my-2">
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${
              (currentAccount?.floating_pnl || 0) > 0 ? "text-emerald-400" :
              (currentAccount?.floating_pnl || 0) < 0 ? "text-rose-400" : "text-zinc-200"
            }`}>
              {(currentAccount?.floating_pnl || 0) >= 0 ? `+$${(currentAccount?.floating_pnl || 0).toFixed(2)}` : `-$${Math.abs(currentAccount?.floating_pnl || 0).toFixed(2)}`}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              USD (กำไร/ขาดทุนของออเดอร์ที่เปิดอยู่)
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
            <span>ความเสี่ยงไม้ค้าง:</span>
            <span className="text-zinc-300 font-mono">{open_positions?.length ? `${open_positions.length} ไม้ในตลาด` : "0% (ไม่มีความเสี่ยง)"}</span>
          </div>
        </div>

        {/* Daily Realized PnL Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>กำไรสะสมวันนี้ (Realized)</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
              TARGET +3%
            </span>
          </div>
          <div className="my-2">
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${
              (summary.daily_pnl_usd || 0) > 0 ? "text-emerald-400" :
              (summary.daily_pnl_usd || 0) < 0 ? "text-rose-400" : "text-zinc-200"
            }`}>
              {(summary.daily_pnl_usd || 0) >= 0 ? `+$${(summary.daily_pnl_usd || 0).toFixed(2)}` : `-$${Math.abs(summary.daily_pnl_usd || 0).toFixed(2)}`}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              {(summary.daily_return_pct || 0) >= 0 ? `+${(summary.daily_return_pct || 0).toFixed(2)}%` : `${(summary.daily_return_pct || 0).toFixed(2)}%`} (เป้าหมาย +$300)
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
            <span>เป้าหมายกำไรรายวัน:</span>
            <span className="text-emerald-400 font-mono">+3.0% Soft Lock</span>
          </div>
        </div>
      </div>

      {/* Real-time Execution State Banner */}
      {execStatus && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          execStatus.state === "IN_POSITION" 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-200" 
            : execStatus.state === "WAITING"
            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200"
            : "bg-zinc-900 border-zinc-800 text-zinc-300"
        }`}>
          <div className="flex items-center gap-3">
            <Activity className={`w-5 h-5 shrink-0 ${
              execStatus.state === "IN_POSITION" ? "text-amber-400 animate-pulse" : execStatus.state === "WAITING" ? "text-cyan-400" : "text-zinc-500"
            }`} />
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2">
                <span>สถานะคำสั่งซื้อขายปัจจุบัน:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  execStatus.badge_color === "amber" ? "bg-amber-500/20 text-amber-300" :
                  execStatus.badge_color === "cyan" ? "bg-cyan-500/20 text-cyan-300" : "bg-zinc-800 text-zinc-400"
                }`}>
                  {execStatus.badge}
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-90 font-sans">
                {execStatus.message}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono shrink-0 flex items-center gap-2">
            <span className="text-zinc-400">ออเดอร์ในตลาด:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${execStatus.active_count > 0 ? "bg-amber-500 text-black font-extrabold" : "bg-zinc-800 text-zinc-300"}`}>
              {execStatus.active_count} ไม้
            </span>
          </div>
        </div>
      )}

      {/* Open Positions Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              ออเดอร์ที่เปิดอยู่ในตลาด (Active Open Positions)
            </h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">สถานะพอร์ต:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              open_positions && open_positions.length > 0 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {open_positions && open_positions.length > 0 ? `ถือ ${open_positions.length} ไม้ในตลาด` : "0 ไม้ในตลาด (FLAT / CASH 100%)"}
            </span>
          </div>
        </div>

        {open_positions && open_positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-mono border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">สินทรัพย์</th>
                  <th className="py-3 px-4">คำสั่ง</th>
                  <th className="py-3 px-4 text-right">Volume (Lot)</th>
                  <th className="py-3 px-4 text-right">ราคาเปิด</th>
                  <th className="py-3 px-4 text-right">ราคาปัจจุบัน</th>
                  <th className="py-3 px-4 text-right">SL / TP</th>
                  <th className="py-3 px-4 text-right">Floating PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 font-mono">
                {open_positions.map((pos, idx) => {
                  const isBuy = String(pos.type).toUpperCase().includes("BUY") || pos.type === 0;
                  return (
                    <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-4 text-zinc-400">#{pos.ticket || idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-zinc-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{pos.symbol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-300">{pos.lots || pos.volume || "-"}</td>
                      <td className="py-3 px-4 text-right text-zinc-300">${pos.open_price?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-zinc-200 font-bold">${(pos.current_price || pos.open_price)?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-zinc-400">
                        {pos.sl ? `$${pos.sl.toFixed(2)}` : "-"} / {pos.tp ? `$${pos.tp.toFixed(2)}` : "-"}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${(pos.profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {(pos.profit || 0) >= 0 ? `+$${(pos.profit || 0).toFixed(2)}` : `-$${Math.abs(pos.profit || 0).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Compass className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-zinc-200 text-sm font-bold font-mono">
                ขณะนี้ถือ 0 ไม้ในตลาด (Flat / In Cash 100%)
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl mx-auto leading-relaxed">
                เงินทุนทั้งหมด <strong>${(currentAccount?.balance || 10000).toLocaleString()} USD</strong> ปลอดภัยอยู่ในรูปเงินสด ไม่มีความเสี่ยงค้างในตลาด<br/>
                บอท 9 หน่วยรบ (Gold, BTC, ETH, Forex, Energy) กำลังมอนิเตอร์แท่งเทียน M5/M15 ตามเงื่อนไข Confluence Gate (Trend + Momentum + Vision) เมื่อได้เปรียบจึงจะเปิดออเดอร์
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-zinc-400">
              <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                🛡️ Max Daily Cutoff: -2.0% (-${Math.round((currentAccount?.balance || 10000) * 0.02)})
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                🎯 Daily Target Lock: +3.0% (+${Math.round((currentAccount?.balance || 10000) * 0.03)})
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                ⏱️ Cadence Pacer: 5-10 นาที
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Closed Orders Today */}
      {closed_orders && closed_orders.length > 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                ออเดอร์ที่ปิดทำกำไรแล้ววันนี้ (Closed Orders Today)
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {closed_orders.length} Trades Completed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">สินทรัพย์</th>
                  <th className="py-3 px-4">ประเภท</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">ราคาเปิด</th>
                  <th className="py-3 px-4 text-right">ราคาปิด</th>
                  <th className="py-3 px-4 text-right">กำไรสุทธิ (PnL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {closed_orders.map((ord: any, idx: number) => {
                  const pnl = Number(ord.profit || 0);
                  const isBuy = String(ord.type).toUpperCase().includes("BUY") || ord.type === 0;
                  return (
                    <tr key={idx} className="hover:bg-zinc-900/50">
                      <td className="py-3 px-4 text-zinc-400">#{ord.ticket || idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-zinc-200">{ord.symbol}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-300">{ord.lots || ord.volume}</td>
                      <td className="py-3 px-4 text-right text-zinc-300">${Number(ord.open_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-zinc-300">${Number(ord.close_price).toFixed(2)}</td>
                      <td className={`py-3 px-4 text-right font-bold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9 Specialist Squad Grid */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              หน่วยรบผู้เชี่ยวชาญ 9 สินทรัพย์ (Multi-Asset Specialist Squad)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {specialists?.length || 9} Specialists Configured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(specialists || []).map((spec) => (
            <div key={spec.key} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-zinc-100">{spec.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">
                    {spec.category}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {spec.timeframe}
                </span>
              </div>

              <div className="text-xs text-zinc-400">
                <div className="text-zinc-300 font-medium">{spec.name}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">กลยุทธ์: {spec.strategy}</div>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">สถานะ:</span>
                <span className="text-emerald-400 font-semibold">{spec.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candlestick Chart Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              ภาพกราฟแท่งเทียนที่วิเคราะห์ (Multimodal Vision Charts)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {charts.length} Charts Rendered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charts.map((chart) => (
            <div
              key={chart.filename}
              onClick={() => setSelectedChart(chart)}
              className="group cursor-pointer rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getChartImageUrl(chart.filename)}
                  alt={chart.filename}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-lg bg-zinc-900/90 text-white text-xs font-medium flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>ดูภาพขยาย</span>
                  </span>
                </div>
              </div>
              <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-200 font-semibold">{chart.filename}</span>
                <span className="text-zinc-500 font-mono text-[11px]">{chart.size_kb} KB</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Self-Learning Journal Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="text-lg font-bold text-white">
            สมุดจดบันทึกและการเรียนรู้ของบอท (Self-Learning Notebook)
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "rules"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Learned Rules (กฎที่ตกผลึก)
          </button>
          <button
            onClick={() => setActiveTab("mistakes")}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "mistakes"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Mistakes Database (ฐานข้อมูลข้อผิดพลาด)
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {activeTab === "rules" ? learned_rules : mistakes_database}
        </div>
      </div>

      {/* Modal for Chart Zoom */}
      {selectedChart && (
        <div 
          onClick={() => setSelectedChart(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-mono text-sm text-zinc-100 font-bold">{selectedChart.filename}</span>
              <button
                onClick={() => setSelectedChart(null)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getChartImageUrl(selectedChart.filename)}
                alt={selectedChart.filename}
                className="max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
