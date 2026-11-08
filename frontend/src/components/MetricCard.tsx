import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: "emerald" | "amber" | "cyan" | "rose" | "blue" | "zinc";
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  color = "cyan",
  icon,
}) => {
  const borderColors = {
    emerald: "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400",
    amber: "border-amber-500/20 hover:border-amber-500/40 text-amber-400",
    cyan: "border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400",
    rose: "border-rose-500/20 hover:border-rose-500/40 text-rose-400",
    blue: "border-blue-500/20 hover:border-blue-500/40 text-blue-400",
    zinc: "border-zinc-800 hover:border-zinc-700 text-zinc-300",
  };

  return (
    <div className={`p-4 rounded-xl bg-zinc-900/60 border ${borderColors[color]} transition-all duration-200 backdrop-blur-sm flex flex-col justify-between`}>
      <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
        <span>{label}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <div className="mt-2 text-xl font-bold tracking-tight text-white font-mono">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-[11px] text-zinc-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};
