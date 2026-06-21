"use client";

import { useState, useEffect, useCallback } from "react";
import { Radar, ExternalLink, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";

interface LiveExchange {
  id: string;
  name: string;
  year_established: number | null;
  country: string | null;
  url: string;
  image: string;
  trust_score: number;
  trust_score_rank: number;
  trade_volume_24h_btc: number;
  trade_volume_24h_btc_normalized: number;
}

interface EnrichedExchange extends LiveExchange {
  type: "CEX" | "DEX";
  inPipeline: boolean;
  inRenewal: boolean;
  tier: string;
  pipelineSignal: string;
  volumeUsd: number;
}

// Known DEX IDs from CoinGecko
const DEX_IDS = new Set([
  "uniswap", "uniswap_v2", "uniswap_v3", "curve", "pancakeswap", "pancakeswap_new",
  "sushiswap", "dydx", "balancer", "bancor", "kyber", "1inch", "dodo",
  "0x", "quickswap", "traderjoe", "velodrome", "aerodrome", "raydium",
  "orca", "jupiter", "hyperliquid"
]);

// Pipeline & renewal cross-reference (matches mock deal company names)
const PIPELINE_MAP: Record<string, { tier: string; signal: string }> = {
  "binance":    { tier: "Enterprise", signal: "🟡 In negotiation" },
  "okx":        { tier: "Pro",        signal: "🟡 Proposal sent" },
  "bitget":     { tier: "Pro",        signal: "🟡 Prospect — outreach due" },
  "bybit":      { tier: "Pro",        signal: "🔴 Renewal at risk" },
  "wintermute": { tier: "Enterprise", signal: "🟢 Closed Won" },
};

const TIER_COLORS: Record<string, string> = {
  Enterprise: "text-[#8DC647] bg-green-900/30",
  Pro:        "text-blue-400 bg-blue-900/30",
  Analyst:    "text-yellow-400 bg-yellow-900/30",
  "—":        "text-[#8B949E] bg-[#21262D]",
};

function fmtVol(btc: number, btcPrice = 65000) {
  const usd = btc * btcPrice;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${usd.toFixed(0)}`;
}

export default function ProspectRadar() {
  const [exchanges, setExchanges] = useState<EnrichedExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [filter, setFilter] = useState<"All" | "CEX" | "DEX" | "Gaps">("All");
  const [selected, setSelected] = useState<EnrichedExchange | null>(null);
  const [btcPrice, setBtcPrice] = useState(65000);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch BTC price for USD conversion
      const priceRes = await fetch("/api/cg?path=%2Fsimple%2Fprice&ids=bitcoin&vs_currencies=usd");
      const priceData = await priceRes.json();
      const btc = priceData?.bitcoin?.usd ?? 65000;
      setBtcPrice(btc);

      // Fetch top 30 exchanges
      const res = await fetch("/api/cg?path=%2Fexchanges&per_page=30&page=1");
      const data: LiveExchange[] = await res.json();

      if (!Array.isArray(data)) throw new Error("bad response");

      const enriched: EnrichedExchange[] = data.map(ex => {
        const pipelineInfo = PIPELINE_MAP[ex.id];
        const inPipeline = !!pipelineInfo && !pipelineInfo.signal.includes("Renewal");
        const inRenewal  = !!pipelineInfo && pipelineInfo.signal.includes("Renewal");
        return {
          ...ex,
          type: DEX_IDS.has(ex.id) ? "DEX" : "CEX",
          inPipeline,
          inRenewal,
          tier: pipelineInfo?.tier ?? "—",
          pipelineSignal: pipelineInfo?.signal ?? "🔴 Not in pipeline",
          volumeUsd: ex.trade_volume_24h_btc * btc,
        };
      });

      setExchanges(enriched);
      setLastUpdated(new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = exchanges.filter(e => {
    if (filter === "CEX")  return e.type === "CEX";
    if (filter === "DEX")  return e.type === "DEX";
    if (filter === "Gaps") return !e.inPipeline && !e.inRenewal;
    return true;
  });

  const gaps    = exchanges.filter(e => !e.inPipeline && !e.inRenewal);
  const covered = exchanges.filter(e => e.inPipeline || e.inRenewal);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Radar className="w-4 h-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">CEX/DEX Prospect Radar</h2>
        {lastUpdated && <span className="text-xs text-[#8B949E]">· {lastUpdated}</span>}
        <button onClick={load} disabled={loading}
          className="ml-auto p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 text-[#8B949E] ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{exchanges.length}</div>
          <div className="text-xs text-[#8B949E]">Live Exchanges</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#8DC647]">{covered.length}</div>
          <div className="text-xs text-[#8B949E]">In Pipeline</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{gaps.length}</div>
          <div className="text-xs text-[#8B949E]">Coverage Gaps</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-400">
            {exchanges.filter(e => e.trust_score >= 8 && !e.inPipeline && !e.inRenewal).length}
          </div>
          <div className="text-xs text-[#8B949E]">High-Trust Gaps</div>
        </div>
      </div>

      {/* Gap alert */}
      {gaps.length > 0 && !loading && (
        <div className="mb-3 p-2.5 bg-orange-900/20 border border-orange-800/40 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-300">
            <span className="font-medium">{gaps.length} exchanges not in pipeline</span> — top gaps: {gaps.slice(0, 3).map(g => g.name).join(", ")}{gaps.length > 3 ? ` +${gaps.length - 3} more` : ""}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {(["All", "CEX", "DEX", "Gaps"] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setSelected(null); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8DC647] text-black" : "bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]"}`}>
            {f}{f === "Gaps" ? ` (${gaps.length})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#21262D] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-xs text-red-400">Failed to load exchange data. Click refresh to retry.</div>
      ) : (
        <>
          {/* Exchange list */}
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {filtered.map(ex => (
              <div key={ex.id}>
                <div
                  onClick={() => setSelected(selected?.id === ex.id ? null : ex)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    !ex.inPipeline && !ex.inRenewal
                      ? "border-red-900/40 bg-red-900/10 hover:bg-red-900/20"
                      : "border-[#21262D] hover:bg-[#21262D]/50"
                  } ${selected?.id === ex.id ? "ring-1 ring-[#8DC647]/40" : ""}`}>

                  {/* Exchange image */}
                  {ex.image && (
                    <img src={ex.image} alt={ex.name} width={24} height={24} className="rounded-full flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#E6EDF3] truncate">{ex.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ex.type === "CEX" ? "text-blue-400 bg-blue-900/30" : "text-purple-400 bg-purple-900/30"}`}>
                        {ex.type}
                      </span>
                      {ex.tier !== "—" && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TIER_COLORS[ex.tier]}`}>{ex.tier}</span>
                      )}
                    </div>
                    <div className="text-xs text-[#8B949E] mt-0.5 truncate">{ex.pipelineSignal}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-[#E6EDF3]">{fmtVol(ex.trade_volume_24h_btc, btcPrice)}</div>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <span className="text-xs text-[#8B949E]">#{ex.trust_score_rank}</span>
                      <span className={`text-xs font-medium ${ex.trust_score >= 8 ? "text-green-400" : ex.trust_score >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                        TS {ex.trust_score}
                      </span>
                    </div>
                  </div>

                  <a href={ex.url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Expanded detail panel */}
                {selected?.id === ex.id && (
                  <div className="mx-1 mb-1 p-3 bg-[#0D1117] border border-[#21262D] rounded-b-lg border-t-0 space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[#8B949E] mb-0.5">Country</div>
                        <div className="text-[#E6EDF3]">{ex.country ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-[#8B949E] mb-0.5">Founded</div>
                        <div className="text-[#E6EDF3]">{ex.year_established ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-[#8B949E] mb-0.5">24h Volume</div>
                        <div className="text-[#E6EDF3] font-medium">{fmtVol(ex.trade_volume_24h_btc, btcPrice)}</div>
                      </div>
                      <div>
                        <div className="text-[#8B949E] mb-0.5">Trust Score</div>
                        <div className={`font-medium ${ex.trust_score >= 8 ? "text-green-400" : ex.trust_score >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                          {ex.trust_score}/10
                        </div>
                      </div>
                    </div>
                    {!ex.inPipeline && !ex.inRenewal && (
                      <div className="pt-2 border-t border-[#21262D]">
                        <div className="flex items-center gap-1.5 text-xs text-orange-400">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">Recommended action:</span>
                        </div>
                        <div className="text-xs text-[#8B949E] mt-1">
                          {ex.trust_score >= 8
                            ? `High-trust exchange with significant volume. Priority prospect — add to pipeline and assign owner.`
                            : ex.trust_score >= 5
                            ? `Mid-tier exchange. Qualify trading volume and API data needs before outreach.`
                            : `Lower trust score — monitor for improvement before investing outreach effort.`}
                        </div>
                      </div>
                    )}
                    <a href={`https://www.coingecko.com/en/exchanges/${ex.id}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#8DC647] hover:underline">
                      <ExternalLink className="w-3 h-3" /> View on CoinGecko
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 pt-3 border-t border-[#21262D] text-xs text-[#8B949E]">
        Live data via CoinGecko <code className="text-[#8DC647]">/exchanges</code> · Trust score 1–10 · Click any row for details
      </div>
    </div>
  );
}
