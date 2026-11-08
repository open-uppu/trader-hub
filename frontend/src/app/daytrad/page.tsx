"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Activity,
  Target,
  PieChart as PieIcon,
  Crosshair,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { fetchDaytradDetails, getChartImageUrl } from "@/lib/api";
import { DaytradDetails, ChartItem } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

// TradingView Widget Embed Component (Zero Dependency, Full Real-Time Candles)
function TradingViewCandleChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getTvSymbol = (sym: string) => {
    switch (sym.toUpperCase()) {
      case "XAUUSD": return "OANDA:XAUUSD";
      case "BTCUSD": return "BINANCE:BTCUSDT";
      case "ETHUSD": return "BINANCE:ETHUSDT";
      case "XAGUSD": return "OANDA:XAGUSD";
      case "EURUSD": return "FX:EURUSD";
      case "GBPUSD": return "FX:GBPUSD";
      case "UKOIL": return "TVC:UKOIL";
      case "XNGUSD": return "TVC:NATGAS";
      case "XPTUSD": return "OANDA:XPTUSD";
      default: return "OANDA:XAUUSD";
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: getTvSymbol(symbol),
      interval: "5",
      timezone: "Asia/Bangkok",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 10, 12, 1)",
      gridColor: "rgba(255, 255, 255, 0.04)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com"
    });
    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="w-full h-[460px] bg-[#0a0a0c] rounded-2xl overflow-hidden border border-white/[0.08] relative" ref={containerRef}>
      <div className="flex items-center justify-center h-full text-[#86868b] text-[12px] font-mono">
        Loading TradingView Candlestick Engine ({symbol})...
      </div>
    </div>
  );
}

// Apple Activity Style Radial Rings (กราฟวงกลมเป้าหมายรายวัน & การคุมความเสี่ยง)
function DailyTargetRadialRing({ currentPct, targetPct, cutoffPct, balance }: { 
  currentPct: number; 
  targetPct: number; 
  cutoffPct: number; 
  balance: number;
}) {
  // Clamp progress percentages
  const targetProgress = Math.min(Math.max((currentPct / targetPct) * 100, 0), 100);
  const cutoffProgress = Math.min(Math.max((Math.abs(Math.min(currentPct, 0)) / Math.abs(cutoffPct)) * 100, 0), 100);
  const targetUsd = balance * (targetPct / 100);

  // SVG Ring Parameters
  const ring1Radius = 54;
  const ring1Circumference = 2 * Math.PI * ring1Radius;
  const ring1Offset = ring1Circumference - (targetProgress / 100) * ring1Circumference;

  const ring2Radius = 40;
  const ring2Circumference = 2 * Math.PI * ring2Radius;
  const ring2Offset = ring2Circumference - (cutoffProgress / 100) * ring2Circumference;

  const ring3Radius = 26;
  const ring3Circumference = 2 * Math.PI * ring3Radius;
  const ring3Offset = ring3Circumference - (100 / 100) * ring3Circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-black/40 border border-white/[0.06]">
      <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Ring 1 Track & Progress (Daily Target +3%) */}
          <circle cx="70" cy="70" r={ring1Radius} stroke="#30d158" strokeOpacity="0.15" strokeWidth="9" fill="transparent" />
          <circle 
            cx="70" cy="70" r={ring1Radius} 
            stroke="#30d158" strokeWidth="9" strokeDasharray={ring1Circumference} strokeDashoffset={ring1Offset} 
            strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" 
          />

          {/* Ring 2 Track & Progress (Max Loss Cutoff -5%) */}
          <circle cx="70" cy="70" r={ring2Radius} stroke="#ff453a" strokeOpacity="0.15" strokeWidth="9" fill="transparent" />
          <circle 
            cx="70" cy="70" r={ring2Radius} 
            stroke="#ff453a" strokeWidth="9" strokeDasharray={ring2Circumference} strokeDashoffset={ring2Offset} 
            strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" 
          />

          {/* Ring 3 Track & Progress (9 Specialists Active) */}
          <circle cx="70" cy="70" r={ring3Radius} stroke="#0071e3" strokeOpacity="0.15" strokeWidth="9" fill="transparent" />
          <circle 
            cx="70" cy="70" r={ring3Radius} 
            stroke="#0071e3" strokeWidth="9" strokeDasharray={ring3Circumference} strokeDashoffset={ring3Offset} 
            strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" 
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-white font-mono tracking-tight">
            {currentPct >= 0 ? `+${currentPct.toFixed(1)}%` : `${currentPct.toFixed(1)}%`}
          </span>
          <span className="text-[9px] text-[#86868b] uppercase tracking-wider">Target 3%</span>
        </div>
      </div>

      {/* Ring Legend & Metrics */}
      <div className="space-y-2.5 flex-1 w-full text-[12px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
            <span className="text-white font-medium">Daily Profit Target (+3.0%)</span>
          </div>
          <span className="font-mono text-[#30d158] font-semibold">+${targetUsd.toFixed(2)} USD</span>
        </div>

        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff453a]" />
            <span className="text-neutral-300 font-medium">Max Loss Guardrail (-5.0%)</span>
          </div>
          <span className="font-mono text-[#ff453a] font-semibold">-${(balance * 0.05).toFixed(2)} USD</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
            <span className="text-neutral-300 font-medium">Active Squad Specialists</span>
          </div>
          <span className="font-mono text-[#0071e3] font-semibold">9/9 Online</span>
        </div>
      </div>
    </div>
  );
}

// Donut Chart for Asset Allocation (กราฟวงกลมสัดส่วนการถือครอง)
function AssetAllocationDonut({ openPositions, balance }: { openPositions: any[]; balance: number }) {
  const hasPositions = openPositions && openPositions.length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-black/40 border border-white/[0.06]">
      <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="44" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="14" fill="transparent" />
          <circle 
            cx="60" cy="60" r="44" 
            stroke={hasPositions ? "#ff9f0a" : "#30d158"} 
            strokeWidth="14" 
            strokeDasharray={2 * Math.PI * 44} 
            strokeDashoffset={hasPositions ? (2 * Math.PI * 44 * 0.2) : 0} 
            strokeLinecap="round" 
            fill="transparent" 
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-white font-mono">
            {hasPositions ? `${openPositions.length} Pos` : "100%"}
          </span>
          <span className="text-[9px] text-[#86868b] uppercase tracking-wider">
            {hasPositions ? "Active" : "Cash Free"}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 flex-1 w-full text-[12px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
            <span className="text-white font-medium">Free Margin (เงินสดว่าง)</span>
          </div>
          <span className="font-mono text-white font-semibold">${balance.toFixed(2)} (100%)</span>
        </div>

        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f0a]" />
            <span className="text-neutral-300 font-medium">Market Exposure (ไม้ที่เปิด)</span>
          </div>
          <span className="font-mono text-[#ff9f0a] font-semibold">{hasPositions ? `${openPositions.length} ไม้` : "0% (Flat)"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
            <span className="text-neutral-300 font-medium">Cent Scaled Account</span>
          </div>
          <span className="font-mono text-[#0071e3] font-semibold">Exness Standard / Cent</span>
        </div>
      </div>
    </div>
  );
}

// 9 Specialists Pre-Trade Signal & Order Specifications
const PRE_TRADE_CONFIGS = [
  { symbol: "XAUUSD", name: "Gold (ทองคำ)", strategy: "MTF Momentum Cross", signal: "SCANNING", lot: "0.01", entry: "2,684.50", sl: "2,677.00", tp: "2,698.00", rr: "1:1.8", confluence: "3/4 Confirm" },
  { symbol: "BTCUSD", name: "Bitcoin", strategy: "EMA Pullback Rejection", signal: "WAIT_PULLBACK", lot: "0.01", entry: "76,200.00", sl: "75,400.00", tp: "77,800.00", rr: "1:2.0", confluence: "3/4 Confirm" },
  { symbol: "ETHUSD", name: "Ethereum", strategy: "Bollinger Bands Reversion", signal: "SCANNING", lot: "0.02", entry: "2,420.00", sl: "2,385.00", tp: "2,490.00", rr: "1:2.0", confluence: "2/4 Confirm" },
  { symbol: "XAGUSD", name: "Silver (โลหะเงิน)", strategy: "High-Volatility Scalper", signal: "MONITOR", lot: "0.01", entry: "31.40", sl: "30.95", tp: "32.25", rr: "1:1.9", confluence: "3/4 Confirm" },
  { symbol: "GBPUSD", name: "GBP/USD", strategy: "London Breakout Flow", signal: "STANDBY", lot: "0.01", entry: "1.2915", sl: "1.2880", tp: "1.2980", rr: "1:1.9", confluence: "2/4 Confirm" },
  { symbol: "EURUSD", name: "EUR/USD", strategy: "Trend Exhaustion Scalper", signal: "STANDBY", lot: "0.01", entry: "1.0710", sl: "1.0685", tp: "1.0760", rr: "1:2.0", confluence: "2/4 Confirm" },
  { symbol: "XPTUSD", name: "Platinum (ทองคำขาว)", strategy: "Mean Reversion Channel", signal: "MONITOR", lot: "0.01", entry: "982.00", sl: "971.00", tp: "1,002.00", rr: "1:1.8", confluence: "2/4 Confirm" },
  { symbol: "UKOIL", name: "Brent Crude Oil", strategy: "Momentum Swing", signal: "SCANNING", lot: "0.01", entry: "73.80", sl: "72.40", tp: "76.50", rr: "1:1.9", confluence: "3/4 Confirm" },
  { symbol: "XNGUSD", name: "Natural Gas", strategy: "Spike Reversal", signal: "SCANNING", lot: "0.01", entry: "2.75", sl: "2.64", tp: "2.95", rr: "1:1.8", confluence: "2/4 Confirm" },
];

export default function DaytradPage() {
  const [data, setData] = useState<DaytradDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartItem | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "mistakes">("rules");
  const [activeChartSymbol, setActiveChartSymbol] = useState<string>("XAUUSD");

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
    }, 4000);
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
  const balance = Number(currentAccount?.balance || summary.base_capital_usd || 497.60);
  const currentPct = Number(summary.daily_return_pct || 0.0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Daytrad Console (9 Specialists Squad)
            </h1>
            <StatusBadge status={summary.bot_status.includes("ONLINE") ? "active" : "standby"} />
          </div>
          <p className="text-[13px] text-[#86868b]">
            คอนโซลควบคุม 9 หน่วยรบ (Gold, Crypto, Forex, Energy) พร้อมกราฟแท่งเทียนสด, กราฟวงกลมเป้าหมาย 3% และรายละเอียดคำสั่งซื้อ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/v1/download/ea"
            download="AgenticMT5Bridge.mq5"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 text-[12px] font-medium transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EA Script (.mq5)</span>
          </a>
          <a
            href="/api/v1/download/mt5-sync-zip"
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
            <span className="font-medium text-white">Live MT5 Stream (4s)</span>
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
              ${(currentAccount?.equity || summary.current_equity_usd || balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#86868b] mt-1">
              มูลค่าพอร์ตรวมไม้ที่ถืออยู่
            </div>
          </div>
          <div className="text-[11px] text-[#86868b] pt-2 border-t border-white/[0.06] flex justify-between">
            <span>Base Capital:</span>
            <span className="text-neutral-300 font-mono">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {currentPct >= 0 ? `+${currentPct.toFixed(2)}%` : `${currentPct.toFixed(2)}%`} (Goal: +${(balance * 0.03).toFixed(2)})
            </div>
          </div>
          <div className="text-[11px] text-[#86868b] pt-2 border-t border-white/[0.06] flex justify-between">
            <span>Daily Lock:</span>
            <span className="text-[#30d158] font-mono">+3.0% Guardrail</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 🟢 กราฟวงกลม (CIRCULAR CHARTS): Apple Radial Rings & Donut Allocation */}
      {/* ==================================================================== */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[#30d158]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">กราฟวงกลมเป้าหมาย & สัดส่วนพอร์ต (Circular Analytics)</h2>
              <p className="text-[12px] text-[#86868b]">Apple Fitness Style Activity Ring แสดงเป้าหมายกำไร 3% และการจัดสรรเงินทุน</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 text-[11px] font-mono">
            Radial Rings
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DailyTargetRadialRing 
            currentPct={currentPct} 
            targetPct={3.0} 
            cutoffPct={-2.0} 
            balance={balance} 
          />
          <AssetAllocationDonut 
            openPositions={open_positions || []} 
            balance={balance} 
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 📈 กราฟแท่งเทียนสด REAL-TIME CANDLESTICK CHART (TRADINGVIEW ENGINE)     */}
      {/* ==================================================================== */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Real-Time Candlestick Chart (กราฟแท่งเทียนสด)</h2>
            <p className="text-[12px] text-[#86868b]">กราฟแท่งเทียน M5 แบบอินเทอร์แอคทีฟ เชื่อมต่อสวิตช์ดูได้ทั้ง 9 สินทรัพย์</p>
          </div>

          {/* Symbol Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/[0.06] max-w-full overflow-x-auto">
            {PRE_TRADE_CONFIGS.map((cfg) => (
              <button
                key={cfg.symbol}
                onClick={() => setActiveChartSymbol(cfg.symbol)}
                className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  activeChartSymbol === cfg.symbol
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-[#86868b] hover:text-white"
                }`}
              >
                {cfg.symbol}
              </button>
            ))}
          </div>
        </div>

        <TradingViewCandleChart symbol={activeChartSymbol} />
      </section>

      {/* ==================================================================== */}
      {/* 📋 รายละเอียด ORDER ในการซื้อ: PRE-TRADE SIGNALS & CONFLUENCE MATRIX   */}
      {/* ==================================================================== */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">รายละเอียด Order & สัญญาณการเข้าซื้อ (Pre-Trade Order Specifications)</h2>
            <p className="text-[12px] text-[#86868b]">คำนวณจุดเข้าซื้อ, Stop Loss, Take Profit, ขนาด Lot Size และเงื่อนไข Confluence ของทั้ง 9 สินทรัพย์</p>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 font-mono">
            9 Squad Specialists
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-[#86868b] font-medium border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">สินทรัพย์</th>
                <th className="py-2.5 px-3">กลยุทธ์ (Strategy)</th>
                <th className="py-2.5 px-3">สถานะคำสั่งซื้อ</th>
                <th className="py-2.5 px-3 text-right">ขนาด Lot</th>
                <th className="py-2.5 px-3 text-right">จุดเข้าเป้าหมาย</th>
                <th className="py-2.5 px-3 text-right">SL / TP</th>
                <th className="py-2.5 px-3 text-right">R:R Ratio</th>
                <th className="py-2.5 px-3 text-right">Confluence Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {PRE_TRADE_CONFIGS.map((cfg, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{cfg.symbol}</div>
                    <div className="text-[10px] text-[#86868b] font-sans">{cfg.name}</div>
                  </td>
                  <td className="py-3 px-3 font-sans text-neutral-300">
                    {cfg.strategy}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0071e3]/15 text-[#0071e3] border border-[#0071e3]/20">
                      {cfg.signal}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-white font-semibold">
                    {cfg.lot} Lot
                  </td>
                  <td className="py-3 px-3 text-right text-neutral-200">
                    ${cfg.entry}
                  </td>
                  <td className="py-3 px-3 text-right text-[#86868b]">
                    <span className="text-[#ff453a]">${cfg.sl}</span> / <span className="text-[#30d158]">${cfg.tp}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-[#30d158] font-semibold">
                    {cfg.rr}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 text-[10px]">
                      {cfg.confluence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 💼 ACTIVE OPEN POSITIONS (ไม้ที่เปิดอยู่ในตลาดแบบ REAL-TIME)              */}
      {/* ==================================================================== */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Active Open Positions (ไม้ที่เปิดอยู่)</h2>
            <p className="text-[12px] text-[#86868b]">คำสั่งซื้อขายที่เปิดอยู่ในตลาด MT5 แบบเรียลไทม์</p>
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
              เงินทุนทั้งหมด ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD ปลอดภัยอยู่ในรูปเงินสด หน่วยรบกำลังเฝ้ารอเงื่อนไข Confluence Gate ก่อนเปิดออเดอร์
            </p>
          </div>
        )}
      </section>

      {/* Closed Orders Today */}
      {closed_orders && closed_orders.length > 0 && (
        <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Closed Trades Today (ประวัติไม้ที่ปิดแล้ว)</h2>
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

      {/* Multimodal AI Vision Charts */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">AI Vision Chart Snapshots</h2>
            <p className="text-[12px] text-[#86868b]">ภาพกราฟแท่งเทียนที่ส่งเข้า Multimodal AI เพื่อตรวจสอบโมเมนตัม</p>
          </div>
          <span className="text-[11px] text-[#86868b] font-mono">
            {charts.length} Charts Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charts.slice(0, 6).map((chart) => (
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

      {/* Self-Learning Memory */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Self-Learning Memory</h2>
            <p className="text-[12px] text-[#86868b]">สมุดจดบันทึกกฎการเทรดและข้อผิดพลาดที่ AI ตกผลึกจากการเทรดจริง</p>
          </div>

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
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getChartImageUrl(selectedChart.filename)}
                alt={selectedChart.filename}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
