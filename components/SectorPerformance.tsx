"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  volume_24h: number;
  top_3_coins: string[];
  top_3_coins_id?: string[];
}

function fmtMcap(n: number) {
  if (!n) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
}

function fmtVol(n: number) {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

const HIGHLIGHT_SECTORS = [
  "decentralized-finance-defi",
  "layer-2",
  "artificial-intelligence",
  "gaming-gamefi-metaverse",
  "meme-token",
  "real-world-assets-rwa",
  "exchange-based-tokens",
  "nft",
];

const SECTOR_INSIGHT: Record<string, string> = {
  "decentralized-finance-defi":   "DeFi protocols are heavy CoinGecko API users for price feeds & yield data",
  "layer-2":                      "L2 teams need real-time bridge & TVL data — strong API prospects",
  "artificial-intelligence":      "AI/crypto projects drive high API call volumes for training data",
  "gaming-gamefi-metaverse":      "GameFi teams need token & NFT price data — Analyst tier fit",
  "meme-token":                   "Meme surges drive spike API usage — Demo→Pro upsell window",
  "real-world-assets-rwa":        "RWA protocols need price oracles & market data — Enterprise fit",
  "exchange-based-tokens":        "Exchange tokens signal active trading platforms — direct prospects",
  "nft":                          "NFT market activity drives GeckoTerminal traffic & API demand",
};

export default function SectorPerformance() {
  const [cats, setCats]     = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cg?path=%2Fcoins%2Fcategories&order=market_cap_desc")
      .then(r => r.json())
      .then((data: Category[]) => {
        const filtered = data.filter(c => HIGHLIGHT_SECTORS.includes(c.id));
        const ordered  = HIGHLIGHT_SECTORS.map(id => filtered.find(c => c.id === id)).filter(Boolean) as Category[];
        setCats(ordered);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-4 h-4 text-[#8DC647]" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Sector Performance</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Live · 24h change · Click for insights</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cats.map(cat => {
              const pct = cat.market_cap_change_24h;
              const isUp = pct >= 0;
              const isSelected = selected === cat.id;
              return (
                <div key={cat.id}
                  onClick={() => setSelected(isSelected ? null : cat.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isUp ? "border-green-900/40 bg-green-900/10 hover:bg-green-900/20"
                         : "border-red-900/40 bg-red-900/10 hover:bg-red-900/20"
                  } ${isSelected ? "ring-1 ring-[#8DC647]/40" : ""}`}>
                  {/* Top 3 coin images */}
                  {cat.top_3_coins?.length > 0 && (
                    <div className="flex -space-x-1 mb-1.5">
                      {cat.top_3_coins.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" width={16} height={16}
                          className="rounded-full border border-[#0D1117]" />
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-[#8B949E] mb-1 truncate">{cat.name}</div>
                  <div className={`text-base font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
                    {isUp ? "+" : ""}{pct?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[#8B949E] mt-0.5">{fmtMcap(cat.market_cap)}</div>
                </div>
              );
            })}
          </div>

          {/* Expanded insight panel */}
          {selected && (() => {
            const cat = cats.find(c => c.id === selected);
            if (!cat) return null;
            const pct = cat.market_cap_change_24h;
            return (
              <div className="mt-3 p-3 bg-[#0D1117] border border-[#21262D] rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-[#E6EDF3]">{cat.name}</div>
                    <div className={`text-xs ${pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pct >= 0 ? "+" : ""}{pct?.toFixed(2)}% 24h
                    </div>
                  </div>
                  <a href={`https://www.coingecko.com/en/categories/${cat.id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#8DC647] hover:underline">
                    <ExternalLink className="w-3 h-3" /> CoinGecko
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                  <div><div className="text-[#8B949E]">Market Cap</div><div className="text-[#E6EDF3] font-medium">{fmtMcap(cat.market_cap)}</div></div>
                  <div><div className="text-[#8B949E]">24h Volume</div><div className="text-[#E6EDF3] font-medium">{fmtVol(cat.volume_24h)}</div></div>
                </div>
                <div className="text-xs text-[#8DC647] font-medium">
                  💡 {SECTOR_INSIGHT[cat.id] ?? "High activity sector — potential API upsell opportunity"}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
