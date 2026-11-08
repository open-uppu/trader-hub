"use client";

import React, { useEffect, useState } from "react";
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
import { fetchEdcaDetails } from "@/lib/api";
import { EdcaDetails } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";

export default function EdcaPage() {
  const [data, setData] = useState<EdcaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchEdcaDetails()
      .then((res) => {
        if (!res) {
          setError("ไม่สามารถเชื่อมต่อ Trader Central Hub Backend ได้ (พอร์ต 8000 ออฟไลน์)");
        } else {
          setData(res);
        }
      })
      .catch((err) => {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล EDCA: " + String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 font-mono text-sm space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div>กำลังโหลดข้อมูล EDCA Investment Advisor (เชื่อมต่อ API พอร์ต 8000)...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl bg-zinc-900/90 border border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
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
          onClick={loadData}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
        >
          ลองเชื่อมต่อใหม่อีกครั้ง (Retry)
        </button>
      </div>
    );
  }

  const { summary, holdings, weekly_execution, advisory, optimal_day, scanner_opportunities, min_order_rule } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              EDCA Investment Portfolio & AI Advisor
            </h2>
            <StatusBadge status="active" />
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            ระบบคำนวณและปรับสัดส่วนการลงทุนตามมูลค่าจริง (Dynamic Value Averaging) พร้อมกฎขั้นต่ำ ฿50 ของ Dime! และเรดาร์สแกนหุ้นใหม่
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Concentration Risk Guard</span>
          </span>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Dime! ขั้นต่ำ ฿50 ต่อไม้</span>
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
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                แผนลงทุนสัปดาห์นี้
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                {weekly_execution.multiplier.toFixed(2)}x
              </span>
            </div>

            <div className="text-3xl font-bold text-white font-mono">
              ฿{weekly_execution.invest_amount_thb.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              คำนวณจากงบฐาน ฿{weekly_execution.base_budget.toLocaleString()} × Multiplier
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">วันเข้าซื้อที่ดีที่สุด:</span>
                <span className="text-emerald-400 font-semibold font-mono">{optimal_day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">การจัดการกระปุกสำรอง:</span>
                <span className="text-zinc-300 font-mono">{weekly_execution.buffer_action}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">เกณฑ์ขั้นต่ำคำสั่งซื้อ:</span>
                <span className="text-amber-400 font-mono font-medium">฿50.00 / ออเดอร์ (Dime!)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
            💡 <strong className="text-zinc-200">กฎคำสั่งซื้อขั้นต่ำ 50 บาท:</strong> หากงบสัปดาห์นั้นไม่พอแบ่ง 2 ไม้ให้ถึงขั้นต่ำ 50 บาท ระบบจะรวมงบเป็น 1 ไม้ใหญ่ หรือทบเข้า Cash Buffer อัตโนมัติ ไม่ส่งคำสั่งซื้อที่ต่ำกว่า 50 บาท
          </div>
        </div>

        {/* AI Advisor Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  บทวิเคราะห์จาก AI Weekly Investment Advisor
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Gemini Multi-Factor
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans max-h-56 overflow-y-auto">
              {advisory}
            </div>
          </div>

          {/* Allocation Candidates Preview */}
          {weekly_execution.allocations && weekly_execution.allocations.length > 0 && (
            <div className="pt-3 border-t border-zinc-800">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>สินทรัพย์แนะนำให้เข้าซื้อสัปดาห์นี้ (ขั้นต่ำ ฿50)</span>
                <span className="text-[10px] text-zinc-500 font-mono font-normal">Enforced Minimum 50 THB</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weekly_execution.allocations
                  .filter((alloc) => alloc.allocated_thb > 0)
                  .map((alloc) => (
                    <div key={alloc.ticker} className="p-2.5 rounded-lg bg-zinc-900 border border-emerald-500/20 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <span>{alloc.ticker}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                            alloc.action.includes("NEW ENTRY") 
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                              : "bg-emerald-500/10 text-emerald-300"
                          }`}>
                            {alloc.action}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{alloc.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white font-mono">฿{alloc.allocated_thb.toLocaleString()}</div>
                        <span className="text-[10px] text-zinc-400 font-mono">
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

      {/* Full Asset Ranking & Queue Leaderboard */}
      {weekly_execution.allocations && weekly_execution.allocations.length > 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                กระดานจัดอันดับความน่าสนใจและการจัดสรรคิว (Asset Ranking & Queue Leaderboard)
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {weekly_execution.allocations.length} Assets Evaluated
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            ระบบจัดอันดับหุ้นทุกตัวในพอร์ตและเรดาร์ตามส่วนลดราคา (Drawdown + Factor Score) โดยจัดสรรงบให้หุ้นอันดับสูงสุดตามขนาดเงินทุน และควบคุมไม่ให้ต่ำกว่า 50 บาท (Dime!) ส่วนหุ้นอันดับถัดไปจะเข้าคิวรอจัดสรรในสัปดาห์ถัดไป
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">อันดับ / สินทรัพย์</th>
                  <th className="py-3 px-4">สถานะการตัดสินใจ</th>
                  <th className="py-3 px-4 text-right">งบจัดสรร (THB)</th>
                  <th className="py-3 px-4 text-right">สัดส่วนงบ (%)</th>
                  <th className="py-3 px-4">เหตุผลและคะแนนกลยุทธ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {weekly_execution.allocations.map((item, idx) => {
                  const isAllocated = item.allocated_thb > 0;
                  const isNew = item.action.includes("NEW ENTRY");
                  const isQueue = item.action.includes("QUEUE");

                  return (
                    <tr 
                      key={item.ticker} 
                      className={`transition-colors ${
                        isAllocated 
                          ? "bg-emerald-500/5 hover:bg-emerald-500/10 font-medium" 
                          : "hover:bg-zinc-900/50 text-zinc-400"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isAllocated ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white text-sm">{item.ticker}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isNew ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" :
                          isAllocated ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                          isQueue ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${isAllocated ? "text-emerald-400 text-sm" : "text-zinc-500"}`}>
                          {item.allocated_thb > 0 ? `฿${item.allocated_thb.toLocaleString()}` : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={isAllocated ? "text-zinc-200" : "text-zinc-500"}>
                          {item.percentage > 0 ? `${item.percentage}%` : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 font-sans text-xs">
                        {item.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Market Opportunity Radar (New Stock Candidates from Market Scanner) */}
      {scanner_opportunities && scanner_opportunities.length > 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-magenta-400 text-pink-400" />
              <h3 className="text-lg font-bold text-white">
                เรดาร์ตรวจจับหุ้นใหม่และของลดราคาในตลาด (Market Opportunity Radar)
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Live Scanner Watchlist
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            ระบบสแกนหุ้นชั้นนำบน Dime! เพื่อเฟ้นหาโอกาสเปิดพอร์ตหุ้นใหม่ (New Entry) หากหุ้นตัวไหนปรับฐานลึกจนได้เกรด A+ หรือ A ระบบจะดึงเข้ามาจัดสรรงบ DCA ประจำสัปดาห์
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4 text-right">ราคาล่าสุด</th>
                  <th className="py-3 px-4 text-right">Drawdown จาก ATH</th>
                  <th className="py-3 px-4 text-right">RSI (14)</th>
                  <th className="py-3 px-4 text-right">ตัวคูณ Mt</th>
                  <th className="py-3 px-4 text-center">เกรด</th>
                  <th className="py-3 px-4">สัญญาณกลยุทธ์ (Signal)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {scanner_opportunities.map((opp) => (
                  <tr key={opp.ticker} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-200">
                      {opp.ticker}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">
                      ${opp.current_price?.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${opp.drawdown_pct < -10 ? "text-rose-400" : "text-amber-400"}`}>
                      {opp.drawdown_pct > 0 ? `+${opp.drawdown_pct.toFixed(1)}%` : `${opp.drawdown_pct.toFixed(1)}%`}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-400">
                      {opp.rsi14?.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-cyan-400 font-bold">
                      {opp.multiplier?.toFixed(2)}x
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        opp.grade === "A+" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                        opp.grade === "A" ? "bg-emerald-500/10 text-emerald-400" :
                        opp.grade === "B" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {opp.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-sans text-xs">
                      {opp.signal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              พอร์ตการลงทุนปัจจุบัน (Dime! Portfolio Holdings)
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {holdings.length} Positions Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">ตลาด</th>
                <th className="py-3 px-4 text-right">มูลค่าตลาด (USD)</th>
                <th className="py-3 px-4 text-right">สัดส่วนพอร์ต (%)</th>
                <th className="py-3 px-4 text-right">ผลตอบแทน (%)</th>
                <th className="py-3 px-4 text-center">สถานะความเสี่ยง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-mono">
              {holdings.map((h) => {
                const isOverweight = (h.market === "US" && h.port_weight >= 20.0) || (h.market === "TH" && h.port_weight >= 40.0);
                return (
                  <tr key={h.ticker} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-200">
                      {h.ticker}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${h.market === "US" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                        {h.market ?? "US"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-200 font-semibold">
                      ${h.market_value_usd.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">
                      {h.port_weight.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${h.return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {h.return_pct >= 0 ? `+${h.return_pct.toFixed(2)}%` : `${h.return_pct.toFixed(2)}%`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOverweight ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overweight (หยุดเติม)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>สัดส่วนเหมาะสม</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
