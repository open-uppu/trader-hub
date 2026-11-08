"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
  Sparkles
} from "lucide-react";
import { fetchDaytradDetails, getChartImageUrl } from "@/lib/api";
import { DaytradDetails, ChartItem } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";

export default function DaytradPage() {
  const [data, setData] = useState<DaytradDetails | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartItem | null>(null);
  const [activeTab, setActiveTab] = useState<"rules" | "mistakes">("rules");

  useEffect(() => {
    fetchDaytradDetails().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        กำลังโหลดข้อมูล Daytrad Console...
      </div>
    );
  }

  const { summary, daily_target, charts, learned_rules, mistakes_database } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Agentic Gold Day Trading (XAUUSD)
            </h2>
            <StatusBadge status={summary.bot_status.includes("ONLINE") ? "active" : "standby"} />
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            คอนโซลควบคุมและมอนิเตอร์บอทเทรดทองคำ อัลกอริทึม Multimodal Chart Vision และระบบล็อกกำไร 3% ต่อวัน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-medium">
            สัญลักษณ์: XAUUSD (Gold)
          </span>
        </div>
      </div>

      {/* Daily Target Lock Progress Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Daily Target Lock Telemetry (เป้าหมาย 3% ต่อวัน)
            </h3>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            สถานะ: <span className="text-emerald-400 font-semibold">{daily_target.status}</span>
          </div>
        </div>

        {/* Visual Progress Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-rose-400 font-semibold">Max Cutoff: -2.0% (-$200)</span>
            <span className="text-zinc-400">Break-even: 0.0% ($0)</span>
            <span className="text-emerald-400 font-semibold">Target Lock: +3.0% (+$300)</span>
          </div>

          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex relative">
            {/* Cutoff zone */}
            <div className="w-2/5 bg-rose-500/20 border-r border-rose-500/40 relative" />
            {/* Target zone */}
            <div className="w-3/5 bg-emerald-500/20 relative" />
            {/* Indicator Marker */}
            <div 
              className="absolute top-0 bottom-0 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-full transition-all"
              style={{ left: "40%" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-zinc-400">
          {daily_target.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
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
