"use client";

import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";

interface Category {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  volume_24h: number;
  top_3_coins: string[];
}

function fmtMcap(n: number) {
  if (!n) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
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

export default function SectorPerformance() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cg?path=%2Fcoins%2Fcategories&order=market_cap_desc")
      .then((r) => r.json())
      .then((data: Category[]) => {
        const filtered = data.filter((c) => HIGHLIGHT_SECTORS.includes(c.id));
        const ordered = HIGHLIGHT_SECTORS.map((id) => filtered.find((c) => c.id === id)).filter(
          Boolean
        ) as Category[];
        setCats(ordered);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-4 h-4 text-[#8DC647]" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Sector Performance</h2>
        <span className="text-xs text-[#8B949E] ml-auto">24h change</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {cats.map((cat) => {
            const pct = cat.market_cap_change_24h;
            const isUp = pct >= 0;
            return (
              <div
                key={cat.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isUp
                    ? "border-green-900/40 bg-green-900/10"
                    : "border-red-900/40 bg-red-900/10"
                }`}
              >
                <div className="text-xs text-[#8B949E] mb-1 truncate">{cat.name}</div>
                <div
                  className={`text-base font-bold ${isUp ? "text-green-400" : "text-red-400"}`}
                >
                  {isUp ? "+" : ""}
                  {pct?.toFixed(1)}%
                </div>
                <div className="text-xs text-[#8B949E] mt-0.5">{fmtMcap(cat.market_cap)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
