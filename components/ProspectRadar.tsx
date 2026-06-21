"use client";

import { useState, useEffect } from "react";
import { Radar, Plus, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface Exchange {
  id: string;
  name: string;
  type: "CEX" | "DEX";
  volume24h: string;
  rank: number;
  inPipeline: boolean;
  inRenewal: boolean;
  tier: string;
  signal: string;
  url: string;
}

const STORAGE_KEY = "revops_prospect_radar";

const MOCK_EXCHANGES: Exchange[] = [
  { id: "binance",        name: "Binance",         type: "CEX", volume24h: "$18.2B", rank: 1,  inPipeline: true,  inRenewal: false, tier: "Enterprise", signal: "In negotiation",          url: "https://www.binance.com" },
  { id: "bybit",          name: "Bybit",            type: "CEX", volume24h: "$4.1B",  rank: 2,  inPipeline: false, inRenewal: true,  tier: "Pro",        signal: "Renewal at risk",         url: "https://www.bybit.com" },
  { id: "okx",            name: "OKX",              type: "CEX", volume24h: "$3.8B",  rank: 3,  inPipeline: true,  inRenewal: false, tier: "Pro",        signal: "Proposal sent",           url: "https://www.okx.com" },
  { id: "bitget",         name: "Bitget",           type: "CEX", volume24h: "$2.9B",  rank: 4,  inPipeline: true,  inRenewal: false, tier: "Pro",        signal: "Prospect — outreach due", url: "https://www.bitget.com" },
  { id: "htx",            name: "HTX",              type: "CEX", volume24h: "$1.4B",  rank: 5,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://www.htx.com" },
  { id: "kucoin",         name: "KuCoin",           type: "CEX", volume24h: "$890M",  rank: 6,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://www.kucoin.com" },
  { id: "gate",           name: "Gate.io",          type: "CEX", volume24h: "$760M",  rank: 7,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://www.gate.io" },
  { id: "crypto-com",     name: "Crypto.com",       type: "CEX", volume24h: "$620M",  rank: 8,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://crypto.com" },
  { id: "uniswap",        name: "Uniswap v3",       type: "DEX", volume24h: "$1.2B",  rank: 1,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://uniswap.org" },
  { id: "curve",          name: "Curve Finance",    type: "DEX", volume24h: "$380M",  rank: 2,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://curve.fi" },
  { id: "pancakeswap",    name: "PancakeSwap",      type: "DEX", volume24h: "$290M",  rank: 3,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://pancakeswap.finance" },
  { id: "dydx",           name: "dYdX",             type: "DEX", volume24h: "$210M",  rank: 4,  inPipeline: false, inRenewal: false, tier: "—",          signal: "🔴 Not in pipeline",      url: "https://dydx.exchange" },
];

const TYPE_COLORS = { CEX: "text-blue-400 bg-blue-900/30", DEX: "text-purple-400 bg-purple-900/30" };
const TIER_COLORS: Record<string, string> = {
  Enterprise: "text-[#8DC647] bg-green-900/30",
  Pro: "text-blue-400 bg-blue-900/30",
  Analyst: "text-yellow-400 bg-yellow-900/30",
  "—": "text-[#8B949E] bg-[#21262D]",
};

export default function ProspectRadar() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filter, setFilter] = useState<"All" | "CEX" | "DEX" | "Gaps">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setExchanges(JSON.parse(saved)); }
    else { setExchanges(MOCK_EXCHANGES); localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EXCHANGES)); }
    setLoading(false);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setExchanges(MOCK_EXCHANGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EXCHANGES));
      setLoading(false);
    }, 600);
  };

  const filtered = exchanges.filter(e => {
    if (filter === "CEX") return e.type === "CEX";
    if (filter === "DEX") return e.type === "DEX";
    if (filter === "Gaps") return !e.inPipeline && !e.inRenewal;
    return true;
  });

  const gaps      = exchanges.filter(e => !e.inPipeline && !e.inRenewal);
  const covered   = exchanges.filter(e => e.inPipeline || e.inRenewal);
  const atRisk    = exchanges.filter(e => e.inRenewal && e.signal.toLowerCase().includes("risk"));

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-4 h-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">CEX/DEX Prospect Radar</h2>
        <button onClick={refresh} className="ml-auto p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 text-[#8B949E] ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{exchanges.length}</div>
          <div className="text-xs text-[#8B949E]">Tracked</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#8DC647]">{covered.length}</div>
          <div className="text-xs text-[#8B949E]">In Pipeline/CRM</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{gaps.length}</div>
          <div className="text-xs text-[#8B949E]">Coverage Gaps</div>
        </div>
      </div>

      {/* Gap alert */}
      {gaps.length > 0 && (
        <div className="mb-3 p-2.5 bg-orange-900/20 border border-orange-800/40 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-300">
            <span className="font-medium">{gaps.length} high-volume exchanges not in pipeline</span> — {gaps.slice(0,3).map(g => g.name).join(", ")}{gaps.length > 3 ? ` +${gaps.length - 3} more` : ""}. Potential upsell targets.
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {(["All", "CEX", "DEX", "Gaps"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8DC647] text-black" : "bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]"}`}>
            {f}{f === "Gaps" ? ` (${gaps.length})` : ""}
          </button>
        ))}
      </div>

      {/* Exchange list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {filtered.map(ex => (
          <div key={ex.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
            !ex.inPipeline && !ex.inRenewal
              ? "border-red-900/40 bg-red-900/10 hover:bg-red-900/20"
              : "border-[#21262D] hover:bg-[#21262D]/50"
          }`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#E6EDF3] truncate">{ex.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[ex.type]}`}>{ex.type}</span>
                {ex.tier !== "—" && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[ex.tier]}`}>{ex.tier}</span>
                )}
              </div>
              <div className="text-xs text-[#8B949E] mt-0.5">{ex.signal}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-medium text-[#E6EDF3]">{ex.volume24h}</div>
              <div className="text-xs text-[#8B949E]">24h vol · #{ex.rank}</div>
            </div>
            <a href={ex.url} target="_blank" rel="noopener noreferrer"
              className="p-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#21262D] text-xs text-[#8B949E]">
        Mock data · Connect CoinGecko <code className="text-[#8DC647]">/exchanges</code> API for live volume rankings
      </div>
    </div>
  );
}
