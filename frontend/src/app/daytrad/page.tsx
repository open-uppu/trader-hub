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
  Compass,
  RefreshCw,
  Download,
  Activity
} from "lucide-react";
import { fetchDaytradDetails, getChartImageUrl } from "@/lib/api";
import { DaytradDetails, ChartItem } from "@/lib/types";
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
      <div className="flex flex-col items-center justify-center h-80 text-[#86868b] text-[13px] space-y-3">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <div className="font-medium">Connecting to Daytrad Engine...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto my-16 rounded-3xl bg-[#161618] border border-white/[0.08] text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-[#ff453a] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">ไม่สามารถเชื่อมต่อ Hub Backend ได้</h3>
          <p className="text-[12px] text-[#86868b] leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={() => loadData(false)}
          className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 font-medium text-[12px] transition-all active:scale-[0.98]"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const { summary, account, charts, learned_rules, mistakes_database, execution_status, specialists, open_positions, closed_orders } = data;
  const execStatus = execution_status || summary.execution_status;
  const currentAccount = account || summary.account;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Daytrad Console
            </h1>
            <StatusBadge status={summary.bot_status.includes("ONLINE") ? "active" : "standby"} />
          </div>
          <p className="text-[13px] text-[#86868b]">
            คอนโซลควบคุม 9 หน่วยรบ (Gold, Crypto, Forex, Energy) พร้อมโมเดล Multimodal Vision และระบบล็อกกำไร 3% ต่อวัน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="http://100.93.63.86:8000/api/v1/download/ea"
            download="AgenticMT5Bridge.mq5"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 text-[12px] font-medium transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EA Script (.mq5)</span>
          </a>
          <a
            href="http://100.93.63.86:8000/api/v1/download/mt5-sync-zip"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-[12px] font-medium transition-all active:scale-[0.98] shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Native Sync Tool</span>
          </a>
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#161618] border border-white/[0.08] text-[12px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            <span className="font-medium text-white">Live Telemetry (5s)</span>
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-[#86868b]">
            Server: <span className="text-white font-medium">{currentAccount?.server || "Exness-MT5Trial14"}</span>
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-[#86868b]">
            Account: <span className="text-white font-mono font-medium">#{currentAccount?.account_number || "416568420"}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#86868b]">
          <span className="text-[11px]">Updated: {lastSyncTime || "Syncing..."}</span>
          <button 
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="p-1.5 rounded-full hover:bg-white/[0.08] text-neutral-300 hover:text-white transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Real-time Portfolio & Equity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Equity */}
        <div className="p-5 rounded-2xl bg-[#161618] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#86868b] text-[12px] font-medium">
            <span>Portfolio Equity</span>
            <span className="px-2 py-0.5 rounded-full bg-[#30d158]/10 text-[#30d158] text-[10px] font-medium">
              Real-time
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums font-mono">
              ${(currentAccount?.equity || summary.current_equity_usd || 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              มูลค่าพอร์ตรวมไม้ที่ถืออยู่
            </div>
          </div>
          <div className="text-[11px] text-[#86868b] pt-2 border-t border-white/[0.06] flex justify-between">
            <span>Base Capital:</span>
            <span className="text-neutral-300 font-mono">${(currentAccount?.balance || summary.base_capital_usd || 10000).toLocaleString()}</span>
          </div>
        </div>

        {/* Balance */}
        <div className="p-5 rounded-2xl bg-[#161618] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#86868b] text-[12px] font-medium">
            <span>Cash Balance</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 text-[10px] font-medium">
              Free Margin
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums font-mono">
              ${(currentAccount?.balance || summary.base_capital_usd || 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              เงินสดว่างพร้อมออกออเดอร์
            </div>
          </div>
          <div className="text-[11px] text-[#86868b] pt-2 border-t border-white/[0.06] flex justify-between">
            <span>Available:</span>
            <span className="text-[#30d158] font-mono">100% Free</span>
          </div>
        </div>

        {/* Floating PnL */}
        <div className="p-5 rounded-2xl bg-[#161618] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#86868b] text-[12px] font-medium">
            <span>Floating PnL</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              (currentAccount?.floating_pnl || 0) > 0 ? "bg-[#30d158]/10 text-[#30d158]" :
              (currentAccount?.floating_pnl || 0) < 0 ? "bg-[#ff453a]/10 text-[#ff453a]" : "bg-white/[0.06] text-[#86868b]"
            }`}>
              {(open_positions?.length || 0)} Active
            </span>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums font-mono ${
              (currentAccount?.floating_pnl || 0) > 0 ? "text-[#30d158]" :
              (currentAccount?.floating_pnl || 0) < 0 ? "text-[#ff453a]" : "text-white"
            }`}>
              {(currentAccount?.floating_pnl || 0) >= 0 ? `+$${(currentAccount?.floating_pnl || 0).toFixed(2)}` : `-$${Math.abs(currentAccount?.floating_pnl || 0).toFixed(2)}`}
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              กำไร/ขาดทุนไม้ที่ยังไม่ปิด
            </div>
          </div>
          <div className="text-[11px] text-[#86868b] pt-2 border-t border-white/[0.06] flex justify-between">
            <span>Market Exposure:</span>
            <span className="text-neutral-300 font-mono">{open_positions?.length ? `${open_positions.length} Positions` : "0% (Flat)"}</span>
          </div>
        </div>

        {/* Daily Realized PnL */}
        <div className="p-5 rounded-2xl bg-[#161618] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[#86868b] text-[12px] font-medium">
            <span>Realized Today</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ff9f0a]/10 text-[#ff9f0a] text-[10px] font-medium">
              Target 3%
            </span>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums font-mono ${
              (summary.daily_pnl_usd || 0) > 0 ? "text-[#30d158]" :
              (summary.daily_pnl_usd || 0) < 0 ? "text-[#ff453a]" : "text-white"
            }`}>
              {(summary.daily_pnl_usd || 0) >= 0 ? `+$${(summary.daily_pnl_usd || 0).toFixed(2)}` : `-$${Math.abs(summary.daily_pnl_usd || 0).toFixed(2)}`}
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              {(summary.daily_return_pct || 0) >= 0 ? `+${(summary.daily_return_pct || 0).toFixed(2)}%` : `${(summary.daily_return_pct || 0).toFixed(2)}%`} (Target: +$300)
            </div>
          </div>
          <div className="text-[11px] text-[#86868b] pt-2 border-t border-white/[0.06] flex justify-between">
            <span>Daily Lock:</span>
            <span className="text-[#30d158] font-mono">+3.0% Guardrail</span>
          </div>
        </div>
      </div>

      {/* Active Execution State Banner */}
      {execStatus && (
        <div className="p-4 rounded-2xl bg-[#161618] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
            <div>
              <div className="text-[12px] font-semibold text-white flex items-center gap-2">
                <span>Execution Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-neutral-200 text-[10px] font-mono">
                  {execStatus.badge}
                </span>
              </div>
              <p className="text-[12px] text-[#86868b] mt-0.5">
                {execStatus.message}
              </p>
            </div>
          </div>

          <div className="text-[12px] text-[#86868b] flex items-center gap-2">
            <span>Active Orders:</span>
            <span className="font-semibold text-white px-2 py-0.5 rounded-full bg-white/[0.08] font-mono">
              {execStatus.active_count}
            </span>
          </div>
        </div>
      )}

      {/* Active Open Positions */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Active Open Positions</h2>
            <p className="text-[12px] text-[#86868b]">คำสั่งซื้อขายที่เปิดอยู่ในตลาดแบบเรียลไทม์</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
            open_positions && open_positions.length > 0 
              ? "bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/20" 
              : "bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20"
          }`}>
            {open_positions && open_positions.length > 0 ? `${open_positions.length} Positions Active` : "Flat / 100% Cash"}
          </span>
        </div>

        {open_positions && open_positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-[#86868b] font-medium border-b border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Open</th>
                  <th className="py-2.5 px-3 text-right">Current</th>
                  <th className="py-2.5 px-3 text-right">SL / TP</th>
                  <th className="py-2.5 px-3 text-right">Floating PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono">
                {open_positions.map((pos, idx) => {
                  const isBuy = String(pos.type).toUpperCase().includes("BUY") || pos.type === 0;
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-[#86868b]">#{pos.ticket || idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-white">{pos.symbol}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isBuy ? "bg-[#30d158]/15 text-[#30d158]" : "bg-[#ff453a]/15 text-[#ff453a]"}`}>
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-300">{pos.lots || pos.volume || "-"}</td>
                      <td className="py-3 px-3 text-right text-neutral-300">${pos.open_price?.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-white font-medium">${(pos.current_price || pos.open_price)?.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-[#86868b]">
                        {pos.sl ? `$${pos.sl.toFixed(2)}` : "-"} / {pos.tp ? `$${pos.tp.toFixed(2)}` : "-"}
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold ${(pos.profit || 0) >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                        {(pos.profit || 0) >= 0 ? `+$${(pos.profit || 0).toFixed(2)}` : `-$${Math.abs(pos.profit || 0).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-black/40 border border-white/[0.04] text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] text-white flex items-center justify-center mx-auto">
              <Compass className="w-4 h-4 text-[#0071e3]" strokeWidth={2} />
            </div>
            <div className="text-white text-[13px] font-medium">
              ขณะนี้ถือ 0 ไม้ในตลาด (Flat / In Cash 100%)
            </div>
            <p className="text-[12px] text-[#86868b] max-w-md mx-auto leading-relaxed">
              เงินทุนทั้งหมด ${(currentAccount?.balance || 10000).toLocaleString()} USD ปลอดภัยอยู่ในรูปเงินสด หน่วยรบกำลังเฝ้ารอเงื่อนไข Confluence Gate ก่อนเปิดออเดอร์
            </p>
          </div>
        )}
      </section>

      {/* Closed Orders Today */}
      {closed_orders && closed_orders.length > 0 && (
        <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Closed Trades Today</h2>
              <p className="text-[12px] text-[#86868b]">ประวัติคำสั่งซื้อขายที่ปิดเสร็จสิ้นแล้ววันนี้</p>
            </div>
            <span className="text-[11px] text-[#86868b] font-mono">
              {closed_orders.length} Trades
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] font-mono">
              <thead className="text-[#86868b] border-b border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Open</th>
                  <th className="py-2.5 px-3 text-right">Close</th>
                  <th className="py-2.5 px-3 text-right">Net PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {closed_orders.map((ord: any, idx: number) => {
                  const pnl = Number(ord.profit || 0);
                  const isBuy = String(ord.type).toUpperCase().includes("BUY") || ord.type === 0;
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-[#86868b]">#{ord.ticket || idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-white">{ord.symbol}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isBuy ? "bg-[#30d158]/15 text-[#30d158]" : "bg-[#ff453a]/15 text-[#ff453a]"}`}>
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-300">{ord.lots || ord.volume}</td>
                      <td className="py-3 px-3 text-right text-neutral-300">${Number(ord.open_price).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-neutral-300">${Number(ord.close_price).toFixed(2)}</td>
                      <td className={`py-3 px-3 text-right font-semibold ${pnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                        {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 9 Specialist Squad Grid */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Multi-Asset Specialist Squad</h2>
            <p className="text-[12px] text-[#86868b]">หน่วยรบเฉพาะทาง 9 สินทรัพย์แยกอิสระ</p>
          </div>
          <span className="text-[11px] text-[#86868b] font-mono">
            {specialists?.length || 9} Configured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(specialists || []).map((spec) => (
            <div key={spec.key} className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] hover:border-white/[0.1] transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white font-mono">{spec.symbol}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/[0.06] text-[#86868b]">
                    {spec.category}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-neutral-300 font-mono">
                  {spec.timeframe}
                </span>
              </div>

              <div className="text-[12px] text-[#86868b]">
                <div className="text-neutral-200 font-medium">{spec.name}</div>
                <div className="text-[11px] text-[#86868b] mt-0.5">กลยุทธ์: {spec.strategy}</div>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                <span className="text-[#86868b]">Status:</span>
                <span className="text-[#30d158] font-medium">{spec.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Candlestick Vision Charts */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Vision Chart Analysis</h2>
            <p className="text-[12px] text-[#86868b]">ภาพกราฟแท่งเทียนที่ส่งเข้า Multimodal AI เพื่อตรวจสอบโมเมนตัม</p>
          </div>
          <span className="text-[11px] text-[#86868b] font-mono">
            {charts.length} Charts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charts.map((chart) => (
            <div
              key={chart.filename}
              onClick={() => setSelectedChart(chart)}
              className="group cursor-pointer rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.14] transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getChartImageUrl(chart.filename)}
                  alt={chart.filename}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>ขยายภาพ</span>
                  </span>
                </div>
              </div>
              <div className="p-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="font-mono text-neutral-300">{chart.filename}</span>
                <span className="text-[#86868b] font-mono">{chart.size_kb} KB</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Self-Learning Journal */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Self-Learning Memory</h2>
            <p className="text-[12px] text-[#86868b]">สมุดจดบันทึกกฎการเทรดและข้อผิดพลาดที่ AI ตกผลึกจากการเทรดจริง</p>
          </div>

          {/* Apple Segmented Control */}
          <div className="p-1 rounded-full bg-black/60 border border-white/[0.08] flex items-center gap-1">
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-4 py-1 rounded-full text-[12px] font-medium transition-all ${
                activeTab === "rules"
                  ? "bg-white text-black shadow-sm"
                  : "text-[#86868b] hover:text-white"
              }`}
            >
              Learned Rules
            </button>
            <button
              onClick={() => setActiveTab("mistakes")}
              className={`px-4 py-1 rounded-full text-[12px] font-medium transition-all ${
                activeTab === "mistakes"
                  ? "bg-white text-black shadow-sm"
                  : "text-[#86868b] hover:text-white"
              }`}
            >
              Mistakes Database
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/50 border border-white/[0.06] font-mono text-[12px] text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {activeTab === "rules" ? learned_rules : mistakes_database}
        </div>
      </section>

      {/* Modal Zoom */}
      {selectedChart && (
        <div 
          onClick={() => setSelectedChart(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#161618] rounded-3xl border border-white/[0.1] overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-[13px] text-white font-medium">{selectedChart.filename}</span>
              <button
                onClick={() => setSelectedChart(null)}
                className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getChartImageUrl(selectedChart.filename)}
                alt={selectedChart.filename}
                className="max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
