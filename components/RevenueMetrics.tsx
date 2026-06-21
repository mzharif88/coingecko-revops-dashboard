"use client";

import { TrendingUp, TrendingDown, Users, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
}

const METRICS: Metric[] = [
  { label: "MRR", value: "$187,400", change: 8.3, changeLabel: "vs last month", icon: TrendingUp, color: "text-[#8DC647]" },
  { label: "ARR", value: "$2.25M", change: 8.3, changeLabel: "annualized", icon: TrendingUp, color: "text-[#8DC647]" },
  { label: "NRR", value: "112%", change: 2.1, changeLabel: "vs last quarter", icon: Users, color: "text-blue-400" },
  { label: "Churn Rate", value: "3.2%", change: -0.8, changeLabel: "vs last month", icon: TrendingDown, color: "text-red-400" },
  { label: "Expansion ARR", value: "$42,000", change: 22.4, changeLabel: "upgrades this Q", icon: ArrowUpRight, color: "text-purple-400" },
  { label: "Avg Contract", value: "$28,200", change: 5.6, changeLabel: "per account", icon: Zap, color: "text-yellow-400" },
];

export default function RevenueMetrics() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-[#8DC647]" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Revenue Metrics</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Mock · Connect CRM for live data</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METRICS.map((m) => {
          const isPositive = m.label === "Churn Rate" ? m.change < 0 : m.change > 0;
          return (
            <div key={m.label} className="bg-[#0D1117] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8B949E]">{m.label}</span>
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(m.change)}% {m.changeLabel}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-[#21262D] grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-[#8B949E]">Demo → Paid Conv.</div>
          <div className="text-sm font-semibold text-[#E6EDF3]">34%</div>
        </div>
        <div>
          <div className="text-xs text-[#8B949E]">Avg Sales Cycle</div>
          <div className="text-sm font-semibold text-[#E6EDF3]">18 days</div>
        </div>
        <div>
          <div className="text-xs text-[#8B949E]">Open Upsell Opps</div>
          <div className="text-sm font-semibold text-purple-400">4 accounts</div>
        </div>
      </div>
    </div>
  );
}
