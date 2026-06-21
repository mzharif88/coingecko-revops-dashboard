"use client";

import { useEffect, useState } from "react";
import { Flame, ExternalLink } from "lucide-react";
import Image from "next/image";

interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number;
    data?: {
      price_change_percentage_24h?: { usd: number };
      price?: string;
      market_cap?: string;
      total_volume?: string;
    };
  };
}

export default function TrendingCoins() {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cg?path=%2Fsearch%2Ftrending")
      .then(r => r.json())
      .then(d => { setCoins(d.coins?.slice(0, 15) ?? []); setLoading(false); });
  }, []);

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Trending on CoinGecko</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Live · Top 15</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-8 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {coins.map((c, i) => {
            const pct = c.item.data?.price_change_percentage_24h?.usd;
            const isSelected = selected === c.item.id;
            return (
              <div key={c.item.id}>
                <div
                  onClick={() => setSelected(isSelected ? null : c.item.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#21262D] transition-colors ${isSelected ? "bg-[#21262D] ring-1 ring-[#8DC647]/30" : ""}`}>
                  <span className="text-xs text-[#8B949E] w-5 text-right flex-shrink-0">{i + 1}</span>
                  <Image src={c.item.thumb} alt={c.item.name} width={20} height={20} className="rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#E6EDF3] truncate block">{c.item.name}</span>
                  </div>
                  <span className="text-xs text-[#8B949E] uppercase flex-shrink-0">{c.item.symbol}</span>
                  {pct !== undefined && (
                    <span className={`text-xs font-medium w-14 text-right flex-shrink-0 ${pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </span>
                  )}
                  <a href={`https://www.coingecko.com/en/coins/${c.item.id}`} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-0.5 text-[#8B949E] hover:text-[#E6EDF3] flex-shrink-0">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {isSelected && (
                  <div className="mx-1 mb-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-b-lg border-t-0">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {c.item.data?.price && (
                        <div><div className="text-[#8B949E]">Price</div><div className="text-[#E6EDF3] font-medium">{c.item.data.price}</div></div>
                      )}
                      {c.item.data?.market_cap && (
                        <div><div className="text-[#8B949E]">Market Cap</div><div className="text-[#E6EDF3]">{c.item.data.market_cap}</div></div>
                      )}
                      {c.item.data?.total_volume && (
                        <div><div className="text-[#8B949E]">24h Volume</div><div className="text-[#E6EDF3]">{c.item.data.total_volume}</div></div>
                      )}
                    </div>
                    <div className="mt-1.5 text-xs text-orange-400">
                      💡 Trending = high search intent — use as prospect conversation opener
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-[#8B949E] mt-3 pt-3 border-t border-[#21262D]">
        Click any coin for details · Use trending coins as conversation starters with prospects
      </p>
    </div>
  );
}
