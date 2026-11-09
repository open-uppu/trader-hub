"use client";

import React from "react";
import { 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Radar,
  Info
} from "lucide-react";
import { useLive } from "@/lib/live";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";

export default function EdcaPage() {
  const { edca: data, status, reconnect } = useLive();
  const loading = !data && status !== "offline";
  const error = !data && status === "offline"
    ? "ไม่สามารถเชื่อมต่อ WebSocket ของ Hub ได้"
    : null;

  const loadData = () => {
    reconnect();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-[#86868b] text-[13px] space-y-3">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <div className="font-medium">Connecting to EDCA Wealth Radar...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto my-16 rounded-3xl bg-[#161618] border border-white/[0.08] text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-[#ff453a] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">ไม่สามารถเชื่อมต่อ Hub Backend ได้</h3>
          <p className="text-[12px] text-[#86868b] leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 font-medium text-[12px] transition-all active:scale-[0.98]"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const { summary, holdings, weekly_execution, advisory, optimal_day, scanner_opportunities } = data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              EDCA Wealth Radar
            </h1>
            <StatusBadge status="active" />
          </div>
          <p className="text-[13px] text-[#86868b]">
            ระบบคำนวณและปรับสัดส่วนการลงทุนตามมูลค่าจริง (Dynamic Value Averaging) พร้อมกฎขั้นต่ำ ฿50 ของ Dime!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-300 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Concentration Guard</span>
          </span>
          <span className="text-[12px] px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-neutral-300 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Dime! Min ฿50</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.kpis.map((kpi, idx) => (
          <MetricCard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            color={kpi.color as any}
          />
        ))}
      </div>

      {/* Weekly Plan & Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Execution Card */}
        <div className="p-7 rounded-3xl bg-[#161618] border border-white/[0.08] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#86868b] tracking-tight">
                แผนลงทุนสัปดาห์นี้
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white font-mono">
                {weekly_execution.multiplier.toFixed(2)}x
              </span>
            </div>

            <div>
              <div className="text-3xl font-semibold text-white font-mono tracking-tight tabular-nums">
                ฿{weekly_execution.invest_amount_thb.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#86868b] mt-1">
                งบฐาน ฿{weekly_execution.base_budget.toLocaleString()} × Multiplier
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#86868b]">วันเข้าซื้อที่เหมาะสม:</span>
                <span className="text-white font-medium font-mono">{optimal_day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#86868b]">การจัดการ Cash Buffer:</span>
                <span className="text-neutral-300 font-mono">{weekly_execution.buffer_action}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#86868b]">เกณฑ์ขั้นต่ำคำสั่งซื้อ:</span>
                <span className="text-[#30d158] font-mono font-medium">฿50.00 (Dime!)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] text-[11px] text-[#86868b] leading-relaxed">
            💡 <strong>กฎคำสั่งซื้อขั้นต่ำ 50 บาท:</strong> หากงบสัปดาห์ไม่พอแบ่ง 2 ไม้ให้ถึงขั้นต่ำ 50 บาท ระบบจะรวมงบเป็น 1 ไม้ใหญ่ หรือพักใน Cash Buffer อัตโนมัติ
          </div>
        </div>

        {/* AI Advisor Panel */}
        <div className="lg:col-span-2 p-7 rounded-3xl bg-[#161618] border border-white/[0.08] flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff9f0a]" />
                <h2 className="text-base font-semibold text-white tracking-tight">
                  AI Weekly Investment Advisory
                </h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#86868b]">
                Gemini Multi-Factor
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05] text-[12px] text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans max-h-56 overflow-y-auto">
              {advisory}
            </div>
          </div>

          {/* Allocation Candidates Preview */}
          {weekly_execution.allocations && weekly_execution.allocations.length > 0 && (
            <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
              <div className="text-[11px] font-medium text-[#86868b] tracking-tight flex items-center justify-between">
                <span>สินทรัพย์แนะนำเข้าซื้อสัปดาห์นี้ (ขั้นต่ำ ฿50)</span>
                <span className="text-[10px] text-[#86868b]">Enforced Minimum 50 THB</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {weekly_execution.allocations
                  .filter((alloc) => alloc.allocated_thb > 0)
                  .map((alloc) => (
                    <div key={alloc.ticker} className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-[12px] flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white font-mono flex items-center gap-2">
                          <span>{alloc.ticker}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-sans font-medium ${
                            alloc.action.includes("NEW ENTRY") 
                              ? "bg-[#0071e3]/15 text-[#0071e3]" 
                              : "bg-[#30d158]/15 text-[#30d158]"
                          }`}>
                            {alloc.action}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#86868b] mt-0.5">{alloc.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white font-mono">฿{alloc.allocated_thb.toLocaleString()}</div>
                        <span className="text-[10px] text-[#86868b] font-mono">
                          {alloc.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Ranking & Queue Leaderboard */}
      {weekly_execution.allocations && weekly_execution.allocations.length > 0 && (
        <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Asset Ranking & Execution Queue</h2>
              <p className="text-[12px] text-[#86868b]">กระดานจัดอันดับหุ้นตามคะแนนส่วนลดราคาและขนาดเงินทุน</p>
            </div>
            <span className="text-[11px] text-[#86868b] font-mono">
              {weekly_execution.allocations.length} Assets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] font-mono">
              <thead className="text-[#86868b] border-b border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3">Rank / Symbol</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3 text-right">Allocated (THB)</th>
                  <th className="py-2.5 px-3 text-right">Weight (%)</th>
                  <th className="py-2.5 px-3 font-sans">Strategic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {weekly_execution.allocations.map((item, idx) => {
                  const isAllocated = item.allocated_thb > 0;
                  const isNew = item.action.includes("NEW ENTRY");
                  const isQueue = item.action.includes("QUEUE");

                  return (
                    <tr 
                      key={item.ticker} 
                      className={`transition-colors ${
                        isAllocated 
                          ? "bg-white/[0.02] hover:bg-white/[0.04]" 
                          : "hover:bg-white/[0.01] text-[#86868b]"
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                            isAllocated ? "bg-white text-black" : "bg-white/[0.06] text-[#86868b]"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-white text-sm">{item.ticker}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium font-sans ${
                          isNew ? "bg-[#0071e3]/15 text-[#0071e3]" :
                          isAllocated ? "bg-[#30d158]/15 text-[#30d158]" :
                          isQueue ? "bg-[#ff9f0a]/15 text-[#ff9f0a]" :
                          "bg-white/[0.06] text-[#86868b]"
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-semibold ${isAllocated ? "text-white text-sm" : "text-[#86868b]"}`}>
                          {item.allocated_thb > 0 ? `฿${item.allocated_thb.toLocaleString()}` : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={isAllocated ? "text-neutral-300" : "text-[#86868b]"}>
                          {item.percentage > 0 ? `${item.percentage}%` : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#86868b] font-sans text-[12px]">
                        {item.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Market Opportunities */}
      {scanner_opportunities && scanner_opportunities.length > 0 && (
        <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Market Opportunity Radar</h2>
              <p className="text-[12px] text-[#86868b]">เรดาร์สแกนหุ้นปรับฐานลึกเพื่อหาโอกาสเปิดพอร์ตใหม่</p>
            </div>
            <span className="text-[11px] text-[#86868b] font-mono">
              Live Watchlist
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] font-mono">
              <thead className="text-[#86868b] border-b border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Drawdown (ATH)</th>
                  <th className="py-2.5 px-3 text-right">RSI (14)</th>
                  <th className="py-2.5 px-3 text-right">Multiplier</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 font-sans">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {scanner_opportunities.map((opp) => (
                  <tr key={opp.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-semibold text-white">
                      {opp.ticker}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      ${opp.current_price?.toFixed(2)}
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${opp.drawdown_pct < -10 ? "text-[#ff453a]" : "text-[#ff9f0a]"}`}>
                      {opp.drawdown_pct > 0 ? `+${opp.drawdown_pct.toFixed(1)}%` : `${opp.drawdown_pct.toFixed(1)}%`}
                    </td>
                    <td className="py-3 px-3 text-right text-[#86868b]">
                      {opp.rsi14?.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right text-white font-semibold">
                      {opp.multiplier?.toFixed(2)}x
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        opp.grade === "A+" ? "bg-[#30d158]/15 text-[#30d158]" :
                        opp.grade === "A" ? "bg-[#30d158]/10 text-[#30d158]" :
                        opp.grade === "B" ? "bg-[#ff9f0a]/10 text-[#ff9f0a]" : "bg-white/[0.06] text-[#86868b]"
                      }`}>
                        {opp.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#86868b] font-sans text-[12px]">
                      {opp.signal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Holdings Table */}
      <section className="p-6 rounded-3xl bg-[#161618] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Portfolio Holdings</h2>
            <p className="text-[12px] text-[#86868b]">สัดส่วนหุ้นและผลตอบแทนในพอร์ตปัจจุบัน</p>
          </div>
          <span className="text-[11px] text-[#86868b] font-mono">
            {holdings.length} Positions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="text-[#86868b] border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Market</th>
                <th className="py-2.5 px-3 text-right">Value (USD)</th>
                <th className="py-2.5 px-3 text-right">Weight (%)</th>
                <th className="py-2.5 px-3 text-right">Return (%)</th>
                <th className="py-2.5 px-3 text-center">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {holdings.map((h) => {
                const isOverweight = (h.market === "US" && h.port_weight >= 20.0) || (h.market === "TH" && h.port_weight >= 40.0);
                return (
                  <tr key={h.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-semibold text-white">
                      {h.ticker}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-[#86868b]">
                        {h.market ?? "US"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-200 font-semibold">
                      ${h.market_value_usd.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-[#86868b]">
                      {h.port_weight.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${h.return_pct >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                      {h.return_pct >= 0 ? `+${h.return_pct.toFixed(2)}%` : `${h.return_pct.toFixed(2)}%`}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {isOverweight ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-[#ff9f0a]/15 text-[#ff9f0a]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overweight</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-[#30d158]/15 text-[#30d158]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
