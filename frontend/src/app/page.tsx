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
  ShieldAlert,
  PlusCircle,
  BarChart3
} from "lucide-react";
import { fetchProjects, fetchEdcaDetails, fetchDaytradDetails } from "@/lib/api";
import { ProjectItem, EdcaDetails, DaytradDetails } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 border border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>CENTRAL TRADING & WEALTH PORTAL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            ภาพรวมระบบและการลงทุนทั้งหมด
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            มอนิเตอร์บอทเทรดทองคำ XAUUSD รายวัน และพอร์ตหุ้น DCA ระยะยาวแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/daytrad"
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Daytrad Console</span>
          </Link>
          <Link
            href="/edca"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold shadow-lg shadow-emerald-950 transition-colors flex items-center gap-1.5"
          >
            <PieChart className="w-3.5 h-3.5 text-black" />
            <span>EDCA Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Global Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="มูลค่าพอร์ต DCA รวม"
          value={edca ? `฿${edca.summary.total_portfolio_thb.toLocaleString()}` : "฿75,414"}
          subtitle={edca ? `$${edca.summary.total_portfolio_usd.toLocaleString()} USD` : "$2,185.93 USD"}
          color="emerald"
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          label="เป้าหมายบอททองคำรายวัน"
          value="+3.0% ($300)"
          subtitle="Max Loss Cutoff: -2.0% ($200)"
          color="amber"
          icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="งบ DCA แนะนำสัปดาห์นี้"
          value={edca ? `฿${edca.summary.recommended_weekly_thb.toLocaleString()}` : "฿1,050"}
          subtitle={edca ? `Multiplier: ${edca.summary.multiplier}x (ฐาน ฿1,000)` : "1.05x Multiplier"}
          color="cyan"
          icon={<Zap className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="วันทำการที่ควรเข้าซื้อ"
          value={edca ? edca.optimal_day : "วันอังคาร"}
          subtitle="หลีกเลี่ยงวันหยุดตลาด US / TH"
          color="blue"
          icon={<Calendar className="w-4 h-4 text-blue-400" />}
        />
      </div>

      {/* Projects Showcase Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>โปรเจกต์ที่เปิดใช้งาน (Active Projects)</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {projects.length} Registered Modules
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Daytrad Bot */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      Agentic Gold Day Trading (XAUUSD)
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    ระบบเทรดทองคำอัตโนมัติ ผสาน Quant Indicators + Multimodal Chart Vision คุมเป้ากำไรรายวัน 3%
                  </p>
                </div>
                <StatusBadge status={daytrad?.summary.bot_status?.includes("ONLINE") ? "active" : "standby"} />
              </div>

              <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-zinc-800/80">
                <div>
                  <div className="text-[11px] text-zinc-500">สินทรัพย์หลัก</div>
                  <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">XAUUSD</div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500">Target Lock</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">+3.0% / วัน</div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500">กราฟที่วิเคราะห์</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                    {daytrad?.summary.charts_available ?? 12} ภาพ
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/daytrad"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
            >
              <span>เข้าสู่หน้าควบคุม Daytrad Console</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>

          {/* Card 2: EDCA Portfolio */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      EDCA Investment Portfolio & AI Advisor
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    วางแผนและเฉลี่ยเงินลงทุนรายสัปดาห์ตาม Valuation (Multi-Factor) ปรับ Multiplier 0.5x - 2.0x
                  </p>
                </div>
                <StatusBadge status="active" />
              </div>

              <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-zinc-800/80">
                <div>
                  <div className="text-[11px] text-zinc-500">หุ้นในพอร์ต</div>
                  <div className="text-sm font-bold text-zinc-200 font-mono mt-0.5">
                    {edca?.summary.holdings_count ?? 13} ตัว
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500">งบลงทุนสัปดาห์นี้</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    ฿{edca?.summary.recommended_weekly_thb.toLocaleString() ?? "1,050"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500">วันเข้าซื้อที่ดีที่สุด</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                    {edca?.optimal_day ?? "วันอังคาร"}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/edca"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
            >
              <span>เข้าสู่หน้าวิเคราะห์พอร์ต EDCA</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Extensibility Guidance */}
      <div className="p-6 rounded-2xl bg-zinc-900/20 border border-dashed border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-200">
              ต้องการเพิ่มโปรเจกต์ใหม่ในอนาคต?
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              เพียงสร้างไฟล์ <code className="text-cyan-400 font-mono">hub/backend/connectors/&lt;new_project&gt;.py</code> แล้วเชื่อมต่อกับระบบ BaseConnector ตัว Hub จะแสดงผลให้ทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
