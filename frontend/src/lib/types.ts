export interface MetricKPI {
  label: string;
  value: string;
  color?: "emerald" | "amber" | "cyan" | "rose" | "blue" | "zinc";
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "standby" | "idle" | "offline";
  online: boolean;
  summary: {
    kpis?: MetricKPI[];
    [key: string]: any;
  };
}

export interface Holding {
  ticker: string;
  market_value_usd: number;
  port_weight: number;
  return_pct: number;
  market?: "US" | "TH";
}

export interface AssetAllocation {
  ticker: string;
  allocated_thb: number;
  percentage: number;
  action: string;
  reason: string;
}

export interface EdcaDetails {
  summary: {
    total_portfolio_usd: number;
    total_portfolio_thb: number;
    base_weekly_budget: number;
    recommended_weekly_thb: number;
    multiplier: number;
    holdings_count: number;
    kpis: MetricKPI[];
  };
  holdings: Holding[];
  weekly_execution: {
    base_budget: number;
    multiplier: number;
    invest_amount_thb: number;
    buffer_action: string;
    allocations: AssetAllocation[];
  };
  advisory: string;
  optimal_day: string;
}

export interface ChartItem {
  filename: string;
  path: string;
  size_kb: number;
  modified: number;
  url: string;
}

export interface DaytradDetails {
  summary: {
    symbol: string;
    target_profit_pct: number;
    max_daily_loss_pct: number;
    base_capital_usd: number;
    daily_target_usd: number;
    max_loss_usd: number;
    bot_status: string;
    charts_available: number;
    kpis: MetricKPI[];
  };
  daily_target: {
    target_pct: number;
    current_pct: number;
    cutoff_pct: number;
    status: string;
    rules: string[];
  };
  charts: ChartItem[];
  learned_rules: string;
  mistakes_database: string;
}
