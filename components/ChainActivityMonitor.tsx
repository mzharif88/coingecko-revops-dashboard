"use client";

import { useState } from "react";
import { Activity, ExternalLink, TrendingUp, AlertCircle, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";

const DUNE_DASHBOARDS = [
  {
    id: "dex-volume",
    title: "DEX Volume by Protocol (7d)",
    description: "Weekly DEX trading volume across Uniswap, Curve, PancakeSwap and other major protocols",
    revopsSignal: "Rising DEX volume = high API call demand from trading desks & aggregators — use as upsell trigger",
    signalColor: "text-[#8DC647]",
    url: "https://dune.com/hagaetc/dex-metrics",
    stats: [
      { label: "Total DEX Vol 7d", value: "$18.1B" },
      { label: "Top Protocol", value: "Uniswap V3" },
      { label: "WoW Change", value: "+12.3%" },
    ],
  },
  {
    id: "dex-users",
    title: "DEX Unique Traders (7d)",
    description: "Unique wallet addresses trading on DEXs this week across all major chains",
    revopsSignal: "Growth in unique traders → GeckoTerminal traffic spike → CoinGecko Ads revenue opportunity",
    signalColor: "text-blue-400",
    url: "https://dune.com/queries/3244881",
    stats: [
      { label: "Unique Traders 7d", value: "2.4M" },
      { label: "Top Chain", value: "Ethereum" },
      { label: "WoW Change", value: "+8.1%" },
    ],
  },
  {
    id: "uniswap-volume",
    title: "Uniswap V3 Daily Volume",
    description: "Uniswap V3 daily trading volume across Ethereum, Arbitrum, Base, and Polygon",
    revopsSignal: "Uniswap volume spikes → clients need more API calls → check against ProspectRadar for coverage gaps",
    signalColor: "text-purple-400",
    url: "https://dune.com/queries/2374897",
    stats: [
      { label: "24h Volume", value: "$1.2B" },
      { label: "Active Pools", value: "12,400+" },
      { label: "WoW Change", value: "+6.7%" },
    ],
  },
];

const ONCHAIN_SIGNALS = [
  { chain: "Ethereum",  metric: "DEX Volume 7d",          value: "$8.4B",       change: +12.3, protocol: "Uniswap V3",   revopsAction: "Add to pipeline — consistently top DEX by volume, not in CRM",                               priority: "high",   duneUrl: "https://dune.com/hagaetc/dex-metrics" },
  { chain: "Base",      metric: "DEX Volume 7d",          value: "$2.1B",       change: +34.7, protocol: "Aerodrome",     revopsAction: "Fastest growing L2 DEX — prioritise outreach, Enterprise tier candidate",                    priority: "high",   duneUrl: "https://dune.com/0xroll/aerodrome-analytics" },
  { chain: "Solana",    metric: "DEX Volume 7d",          value: "$4.8B",       change: +8.1,  protocol: "Jupiter",       revopsAction: "Solana DEX aggregator — high API call volume expected, add to pipeline",                     priority: "high",   duneUrl: "https://dune.com/ilemi/solana-dexs" },
  { chain: "Arbitrum",  metric: "DEX Volume 7d",          value: "$1.6B",       change: -4.2,  protocol: "GMX",           revopsAction: "Declining volume — deprioritise vs Base/Solana opps this quarter",                          priority: "medium", duneUrl: "https://dune.com/gmx-io/gmx-analytics" },
  { chain: "BNB Chain", metric: "DEX Volume 7d",          value: "$1.2B",       change: +2.8,  protocol: "PancakeSwap",   revopsAction: "Stable BSC anchor. Not in pipeline — queue for Analyst tier outreach",                      priority: "medium", duneUrl: "https://dune.com/pancakeswap/pancakeswap-v3" },
  { chain: "Ethereum",  metric: "New Protocols Deployed", value: "14 this week",change: +16.7, protocol: "Various",       revopsAction: "14 new DeFi protocols = 14 potential new API subscribers — feed into outreach sequence",     priority: "high",   duneUrl: "https://dune.com/queries/1285415" },
];

const PRIORITY_STYLES = {
  high:   "border-orange-900/40 bg-orange-900/10",
  medium: "border-[#21262D] bg-transparent",
};

export default function ChainActivityMonitor() {
  const [showSignals, setShowSignals] = useState(true);
  const [expandedDash, setExpandedDash] = useState<string | null>(null);

  const highPriority = ONCHAIN_SIGNALS.filter(s => s.priority === "high").length;
  const totalVol = "$18.1B";

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Chain Activity Monitor</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Mock signals · Dune Analytics</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-cyan-400">{totalVol}</div>
          <div className="text-xs text-[#8B949E]">DEX Vol 7d</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-400">{highPriority}</div>
          <div className="text-xs text-[#8B949E]">High-Pri Signals</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#8DC647]">
            {ONCHAIN_SIGNALS.filter(s => !["Wintermute", "Coinbase"].includes(s.protocol)).length}
          </div>
          <div className="text-xs text-[#8B949E]">Pipeline Gaps</div>
        </div>
      </div>

      {/* High priority alert */}
      {highPriority > 0 && (
        <div className="mb-4 p-2.5 bg-orange-900/20 border border-orange-800/40 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-orange-300">
            <span className="font-medium">{highPriority} high-priority on-chain signals</span> — active DEX protocols not in pipeline. Review and assign owners.
          </span>
        </div>
      )}

      {/* Pipeline signals */}
      <div className="mb-4">
        <button onClick={() => setShowSignals(!showSignals)}
          className="flex items-center gap-2 text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2 hover:text-[#E6EDF3] transition-colors w-full">
          Pipeline Signals from On-Chain Data
          {showSignals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showSignals && (
          <div className="space-y-2">
            {ONCHAIN_SIGNALS.map((sig, i) => (
              <div key={i} className={`p-3 rounded-lg border ${PRIORITY_STYLES[sig.priority as keyof typeof PRIORITY_STYLES]}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#E6EDF3]">{sig.protocol}</span>
                      <span className="text-xs text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{sig.chain}</span>
                      {sig.priority === "high" && (
                        <span className="text-xs text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded font-medium">Priority</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs text-[#8B949E]">{sig.metric}:</span>
                      <span className="text-xs font-medium text-[#E6EDF3]">{sig.value}</span>
                      <span className={`text-xs font-medium ${sig.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {sig.change >= 0 ? "+" : ""}{sig.change}%
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <TrendingUp className="w-3 h-3 text-[#8DC647] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#8B949E]">{sig.revopsAction}</span>
                    </div>
                  </div>
                  <a href={sig.duneUrl} target="_blank" rel="noopener noreferrer"
                    className="p-1 text-[#8B949E] hover:text-cyan-400 transition-colors flex-shrink-0" title="View on Dune">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dune dashboard cards — replaces broken iframes */}
      <div>
        <div className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">Dune Analytics Dashboards</div>
        <div className="space-y-2">
          {DUNE_DASHBOARDS.map(dash => (
            <div key={dash.id} className="border border-[#21262D] rounded-lg overflow-hidden">
              <button onClick={() => setExpandedDash(expandedDash === dash.id ? null : dash.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#21262D]/50 transition-colors text-left">
                <BarChart2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E6EDF3]">{dash.title}</div>
                  <div className="text-xs text-[#8B949E] mt-0.5 truncate">{dash.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={dash.url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded-lg hover:bg-cyan-900/50 transition-colors border border-cyan-800/40">
                    <ExternalLink className="w-3 h-3" /> Dune
                  </a>
                  {expandedDash === dash.id ? <ChevronUp className="w-4 h-4 text-[#8B949E]" /> : <ChevronDown className="w-4 h-4 text-[#8B949E]" />}
                </div>
              </button>

              {expandedDash === dash.id && (
                <div className="border-t border-[#21262D] p-3 bg-[#0D1117]/50 space-y-3">
                  {/* Key stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {dash.stats.map(stat => (
                      <div key={stat.label} className="bg-[#161B22] rounded-lg p-2.5 text-center">
                        <div className="text-sm font-bold text-[#E6EDF3]">{stat.value}</div>
                        <div className="text-xs text-[#8B949E] mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* RevOps insight */}
                  <div className="flex items-start gap-2 p-2.5 bg-[#0D1117] rounded-lg border border-[#21262D]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#8DC647] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-[#8DC647] mb-0.5">RevOps Signal</div>
                      <div className="text-xs text-[#8B949E]">{dash.revopsSignal}</div>
                    </div>
                  </div>
                  {/* CTA */}
                  <a href={dash.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-cyan-900/20 border border-cyan-800/40 rounded-lg text-xs text-cyan-400 hover:bg-cyan-900/40 transition-colors font-medium">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open live chart on Dune Analytics
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#21262D] flex items-center justify-between">
        <span className="text-xs text-[#8B949E]">Mock on-chain signals · Click Dune links for live data</span>
        <a href="https://dune.com/browse/dashboards" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">
          <ExternalLink className="w-3 h-3" /> Browse Dune
        </a>
      </div>
    </div>
  );
}
