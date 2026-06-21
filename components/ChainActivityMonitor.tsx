"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, ExternalLink, RefreshCw, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// Dune public query embed IDs — all public, no API key needed
// These are real Dune queries tracking DEX volume & on-chain activity
const DUNE_EMBEDS = [
  {
    id: "dex-volume",
    title: "DEX Volume by Protocol (7d)",
    queryId: "1285415",
    description: "Weekly DEX trading volume across major protocols",
    revopsSignal: "Rising DEX volume = high API call demand from trading desks & aggregators",
    signalColor: "text-[#8DC647]",
  },
  {
    id: "dex-users",
    title: "DEX Unique Traders (7d)",
    queryId: "3244881",
    description: "Unique wallet addresses trading on DEXs this week",
    revopsSignal: "Growth in unique traders → GeckoTerminal traffic spike → Ads revenue opportunity",
    signalColor: "text-blue-400",
  },
  {
    id: "uniswap-volume",
    title: "Uniswap V3 Daily Volume",
    queryId: "2374897",
    description: "Uniswap V3 daily trading volume across all chains",
    revopsSignal: "Uniswap volume spikes drive API demand — check against ProspectRadar coverage",
    signalColor: "text-purple-400",
  },
];

// Cross-reference: known DEX protocols and their pipeline status
// Maps on-chain protocol name → pipeline signal
const PROTOCOL_PIPELINE_MAP: Record<string, { status: "in-pipeline" | "gap" | "customer"; signal: string; tier?: string }> = {
  "Uniswap":      { status: "gap",         signal: "Not in pipeline — high priority prospect" },
  "Curve":        { status: "gap",         signal: "Not in pipeline — DeFi anchor protocol" },
  "PancakeSwap":  { status: "gap",         signal: "Not in pipeline — BSC dominant DEX" },
  "dYdX":         { status: "gap",         signal: "Not in pipeline — perp DEX, high data needs" },
  "Balancer":     { status: "gap",         signal: "Not in pipeline — multi-token AMM" },
  "Aerodrome":    { status: "gap",         signal: "Not in pipeline — Base chain leading DEX" },
  "Raydium":      { status: "gap",         signal: "Not in pipeline — Solana leading DEX" },
  "Orca":         { status: "gap",         signal: "Not in pipeline — Solana DEX, growing" },
  "Jupiter":      { status: "gap",         signal: "Not in pipeline — Solana aggregator" },
  "Hyperliquid":  { status: "gap",         signal: "Not in pipeline — perp DEX, fastest growing" },
  "SushiSwap":    { status: "gap",         signal: "Not in pipeline — multi-chain AMM" },
};

// On-chain signals enriched with RevOps context
const ONCHAIN_SIGNALS = [
  {
    chain: "Ethereum",
    metric: "DEX Volume 7d",
    value: "$8.4B",
    change: +12.3,
    protocol: "Uniswap V3",
    revopsAction: "Add to pipeline — consistently top DEX by volume, not in CRM",
    priority: "high",
    duneUrl: "https://dune.com/hagaetc/dex-metrics",
  },
  {
    chain: "Base",
    metric: "DEX Volume 7d",
    value: "$2.1B",
    change: +34.7,
    protocol: "Aerodrome",
    revopsAction: "Fastest growing L2 DEX — prioritise outreach, Enterprise tier candidate",
    priority: "high",
    duneUrl: "https://dune.com/queries/3244881",
  },
  {
    chain: "Solana",
    metric: "DEX Volume 7d",
    value: "$4.8B",
    change: +8.1,
    protocol: "Jupiter",
    revopsAction: "Solana DEX aggregator — high API call volume expected, add to pipeline",
    priority: "high",
    duneUrl: "https://dune.com/ilemi/solana-dexs",
  },
  {
    chain: "Arbitrum",
    metric: "DEX Volume 7d",
    value: "$1.6B",
    change: -4.2,
    protocol: "GMX",
    revopsAction: "Declining volume — deprioritise vs Base/Solana opps this quarter",
    priority: "medium",
    duneUrl: "https://dune.com/gmx-io/gmx-analytics",
  },
  {
    chain: "BNB Chain",
    metric: "DEX Volume 7d",
    value: "$1.2B",
    change: +2.8,
    protocol: "PancakeSwap",
    revopsAction: "Stable BSC anchor. Not in pipeline — queue for Analyst tier outreach",
    priority: "medium",
    duneUrl: "https://dune.com/pancakeswap/pancakeswap-v3",
  },
  {
    chain: "Ethereum",
    metric: "New Protocols Deployed",
    value: "14 this week",
    change: +16.7,
    protocol: "Various",
    revopsAction: "14 new DeFi protocols = 14 potential new API subscribers — feed into outreach",
    priority: "high",
    duneUrl: "https://dune.com/queries/1285415",
  },
];

const PRIORITY_STYLES = {
  high:   "border-orange-900/40 bg-orange-900/10",
  medium: "border-[#21262D] bg-transparent",
  low:    "border-[#21262D] bg-transparent",
};

export default function ChainActivityMonitor() {
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);
  const [showSignals, setShowSignals] = useState(true);
  const [embedLoading, setEmbedLoading] = useState<string | null>(null);

  const highPriority = ONCHAIN_SIGNALS.filter(s => s.priority === "high").length;
  const totalVol = "$18.1B";

  const toggleEmbed = (id: string) => {
    if (activeEmbed === id) {
      setActiveEmbed(null);
    } else {
      setEmbedLoading(id);
      setActiveEmbed(id);
      setTimeout(() => setEmbedLoading(null), 2000);
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Chain Activity Monitor</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Dune Analytics · On-chain signals</span>
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
            {ONCHAIN_SIGNALS.filter(s => !Object.keys(PROTOCOL_PIPELINE_MAP).includes(s.protocol) || PROTOCOL_PIPELINE_MAP[s.protocol]?.status === "gap").length}
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

      {/* On-chain signals table */}
      <div className="mb-4">
        <button
          onClick={() => setShowSignals(!showSignals)}
          className="flex items-center gap-2 text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2 hover:text-[#E6EDF3] transition-colors w-full">
          Pipeline Signals from On-Chain Data
          {showSignals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showSignals && (
          <div className="space-y-2">
            {ONCHAIN_SIGNALS.map((sig, i) => (
              <div key={i} className={`p-3 rounded-lg border transition-colors ${PRIORITY_STYLES[sig.priority as keyof typeof PRIORITY_STYLES]}`}>
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
                    className="p-1 text-[#8B949E] hover:text-cyan-400 transition-colors flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dune live embeds */}
      <div>
        <div className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">Live Dune Charts</div>
        <div className="space-y-2">
          {DUNE_EMBEDS.map(embed => (
            <div key={embed.id} className="border border-[#21262D] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleEmbed(embed.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#21262D]/50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E6EDF3]">{embed.title}</div>
                  <div className="text-xs text-[#8B949E] mt-0.5">{embed.description}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`https://dune.com/queries/${embed.queryId}`} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1 text-[#8B949E] hover:text-cyan-400 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {activeEmbed === embed.id
                    ? <ChevronUp className="w-4 h-4 text-[#8B949E]" />
                    : <ChevronDown className="w-4 h-4 text-[#8B949E]" />}
                </div>
              </button>

              {activeEmbed === embed.id && (
                <div className="border-t border-[#21262D]">
                  {embedLoading === embed.id ? (
                    <div className="h-64 flex items-center justify-center bg-[#0D1117]">
                      <div className="text-xs text-[#8B949E] animate-pulse">Loading Dune chart...</div>
                    </div>
                  ) : (
                    <>
                      <iframe
                        src={`https://dune.com/embeds/${embed.queryId}/chart`}
                        width="100%"
                        height="260"
                        frameBorder="0"
                        className="bg-[#0D1117]"
                        title={embed.title}
                      />
                      <div className="px-3 py-2 bg-[#0D1117] border-t border-[#21262D]">
                        <div className="flex items-start gap-1.5">
                          <TrendingUp className="w-3 h-3 text-[#8DC647] flex-shrink-0 mt-0.5" />
                          <span className={`text-xs font-medium ${embed.signalColor}`}>{embed.revopsSignal}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#21262D] flex items-center justify-between">
        <span className="text-xs text-[#8B949E]">On-chain signals via Dune Analytics · Mock metrics · Live embeds when expanded</span>
        <a href="https://dune.com/browse/dashboards" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:underline">
          <ExternalLink className="w-3 h-3" /> Dune
        </a>
      </div>
    </div>
  );
}
