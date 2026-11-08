import React from "react";

interface StatusBadgeProps {
  status: "active" | "standby" | "idle" | "offline" | string;
  online?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, online }) => {
  const isOnline = online ?? (status === "active");

  const colors = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    standby: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    idle: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    offline: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  const badgeColor = colors[status as keyof typeof colors] || colors.offline;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
      <span className="uppercase tracking-wider text-[10px]">{status}</span>
    </span>
  );
};
