"use client";

import { Activity, AlertCircle } from "lucide-react";

interface TierUsage {
  tier: string;
  accounts: number;
  callsPerMonth: number;
  limit: number;
  color: string;
  bgColor: string;
}

// CoinGecko actual monthly call limits (public):
// Demo: 10,000/mo | Analyst: 500,000/mo | Pro: 2,000,000/mo | Enterprise: custom
const TIER_DATA: TierUsage[] = [
  { tier: "Enterprise", accounts: 4,  callsPerMonth: 3200000, limit: 5000000,  color: "text-purple-400", bgColor: "bg-purple-400" },
  { tier: "Pro",        accounts: 9,  callsPerMonth: 1400000, limit: 2000000,  color: "text-blue-400",   bgColor: "bg-blue-400" },
  { tier: "Analyst",    accounts: 14, callsPerMonth: 320000,  limit: 500000,   color: "text-[#8DC647]",  bgColor: "bg-[#8DC647]" },
  { tier: "Demo",       accounts: 31, callsPerMonth: 7800,    limit: 10000,    color: "text-yellow-400", bgColor: "bg-yellow-400" },
];

function fmtCalls(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return `${n}`;
}

export default function ApiUsageMonitor() {
  const totalCalls = TIER_DATA.reduce((s, t) => s + t.callsPerMonth * t.accounts, 0);
  const nearLimit  = TIER_DATA.filter(t => (t.callsPerMonth / t.limit) > 0.8);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">API Usage by Tier</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Mock · Monthly calls</span>
      </div>

      {nearLimit.length > 0 && (
        <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-xs text-yellow-300">
            {nearLimit.map(t => t.tier).join(", ")} tier approaching monthly quota — upsell opportunity
          </span>
        </div>
      )}

      <div className="space-y-4 mb-4">
        {TIER_DATA.map(t => {
          const pct   = Math.min(Math.round((t.callsPerMonth / t.limit) * 100), 100);
          const isHot = pct > 80;
          return (
            <div key={t.tier}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${t.color}`}>{t.tier}</span>
                  <span className="text-xs text-[#8B949E]">{t.accounts} accounts</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${isHot ? "text-yellow-400" : "text-[#8B949E]"}`}>
                    {fmtCalls(t.callsPerMonth)} / {fmtCalls(t.limit)} calls/mo
                  </span>
                  <span className={`text-xs ml-2 ${isHot ? "text-yellow-400 font-semibold" : "text-[#8B949E]"}`}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isHot ? "bg-yellow-400" : t.bgColor}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-[#21262D] grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-[#8B949E]">Total Calls/Month</div>
          <div className="text-sm font-semibold text-[#E6EDF3]">{fmtCalls(totalCalls)}</div>
        </div>
        <div>
          <div className="text-xs text-[#8B949E]">Upgrade Signals</div>
          <div className="text-sm font-semibold text-yellow-400">{nearLimit.length} tier{nearLimit.length !== 1 ? "s" : ""}</div>
        </div>
        <div>
          <div className="text-xs text-[#8B949E]">Total Accounts</div>
          <div className="text-sm font-semibold text-[#E6EDF3]">{TIER_DATA.reduce((s, t) => s + t.accounts, 0)}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-[#8B949E]">
        Limits: Demo 10k · Analyst 500k · Pro 2M · Enterprise custom (calls/month)
      </div>
    </div>
  );
}
