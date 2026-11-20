import React from "react";

interface StatusBadgeProps {
  status: "active" | "standby" | "idle" | "offline" | string;
  online?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, online }) => {
  const isOnline = online ?? (status === "active");

  const colors = {
    active: "bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20",
    standby: "bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/20",
    idle: "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20",
    offline: "bg-white/[0.05] text-[#86868b] border-white/[0.08]",
  };

  const badgeColor = colors[status as keyof typeof colors] || colors.offline;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badgeColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#30d158] animate-pulse" : "bg-[#ff9f0a]"}`} />
      <span className="capitalize tracking-tight">{status}</span>
    </span>
  );
};
