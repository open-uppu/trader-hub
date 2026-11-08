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
  icon,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#161618] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between group">
      <div className="flex items-center justify-between text-[#86868b] text-[12px] font-medium tracking-tight">
        <span>{label}</span>
        {icon && <span className="text-[#86868b] group-hover:text-white transition-colors">{icon}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-[11px] text-[#86868b] font-normal tracking-tight">
          {subtitle}
        </div>
      )}
    </div>
  );
};
