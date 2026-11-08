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
  ShieldCheck
} from "lucide-react";
import { fetchEdcaDetails } from "@/lib/api";
import { EdcaDetails } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";

export default function EdcaPage() {
  const [data, setData] = useState<EdcaDetails | null>(null);

  useEffect(() => {
    fetchEdcaDetails().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        กำลังโหลดข้อมูล EDCA Investment Advisor...
      </div>
    );
  }

  const { summary, holdings, weekly_execution, advisory, optimal_day } = data;

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
            ระบบคำนวณและปรับสัดส่วนการลงทุนตามมูลค่าจริง (Dynamic Value Averaging) พร้อมคำแนะนำจาก AI Advisor ประจำสัปดาห์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Concentration Risk Guard Active</span>
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
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
            💡 <strong className="text-zinc-200">หลักการ EDCA:</strong> สัปดาห์ไหนตลาดแพง ระบบจะลดวงเงินไปเก็บไว้ในกระปุกสำรอง สัปดาห์ไหนตลาดลดราคา ระบบจะดึงเงินมาช้อนซื้อเพิ่ม
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
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                สินทรัพย์แนะนำให้เข้าซื้อสัปดาห์นี้
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weekly_execution.allocations
                  .filter((alloc) => alloc.allocated_thb > 0)
                  .map((alloc) => (
                    <div key={alloc.ticker} className="p-2.5 rounded-lg bg-zinc-900 border border-emerald-500/20 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <span>{alloc.ticker}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-normal">
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
