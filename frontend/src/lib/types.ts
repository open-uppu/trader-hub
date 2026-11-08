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

export interface OpportunityItem {
  ticker: string;
  symbol: string;
  current_price: number;
  drawdown_pct: number;
  rsi14: number;
  multiplier: number;
  grade: string;
  signal: string;
  is_new?: boolean;
}

export interface MinOrderRule {
  min_order_thb: number;
  platform: string;
  enforced: boolean;
  description: string;
}

export interface EdcaDetails {
  summary: {
    total_portfolio_usd: number;
    total_portfolio_thb: number;
    base_weekly_budget: number;
    recommended_weekly_thb: number;
    multiplier: number;
    holdings_count: number;
    min_order_thb?: number;
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
  scanner_opportunities?: OpportunityItem[];
  min_order_rule?: MinOrderRule;
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

export interface SpecialistInfo {
  key: string;
  symbol: string;
  name: string;
  category: string;
  strategy: string;
  timeframe: string;
  status: string;
  last_action?: string;
}

export interface PositionItem {
  ticket?: string | number;
  symbol: string;
  type: string | number;
  lots?: number;
  volume?: number;
  open_price: number;
  current_price?: number;
  profit: number;
  sl?: number;
  tp?: number;
}

export interface ExecutionStatus {
  state: "IN_POSITION" | "WAITING" | "STANDBY";
  badge: string;
  badge_color: "emerald" | "amber" | "cyan" | "rose" | "blue" | "zinc";
  message: string;
  active_count: number;
  connected?: boolean;
  mode?: string;
}

export interface DaytradDetails {
  summary: {
    symbol: string;
    symbols_list?: string[];
    specialists_count?: number;
    target_profit_pct: number;
    max_daily_loss_pct: number;
    base_capital_usd: number;
    current_equity_usd?: number;
    daily_target_usd: number;
    max_loss_usd: number;
    daily_pnl_usd?: number;
    daily_return_pct?: number;
    bot_status: string;
    charts_available: number;
    execution_status?: ExecutionStatus;
    kpis: MetricKPI[];
  };
  execution_status?: ExecutionStatus;
  specialists?: SpecialistInfo[];
  open_positions?: PositionItem[];
  closed_orders?: any[];
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
